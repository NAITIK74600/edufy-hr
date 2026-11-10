import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $ as Network, A as ShieldCheck, Ct as GitFork, Gt as CircleAlert, J as Phone, L as Search, Pt as ExternalLink, X as PenLine, Xt as Check, Yt as ChevronDown, _n as require_react, an as Building, d as Users, h as UserCheck, ht as Layers, i as X, it as Maximize2, m as UserPlus, mn as ArrowRight, n as ZoomIn, ot as Mail, qt as ChevronRight, t as ZoomOut, z as RotateCcw } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { T as hrStore, x as useAuth } from "./index-ByLK1Fqy.js";
// src/components/OrgChart/OrgHierarchyPage.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ROLE_BADGES = {
	managing_director: {
		label: "Managing Director",
		bg: "#fef3c7",
		text: "#b45309",
		border: "#f59e0b",
		ring: "#fbbf24"
	},
	director: {
		label: "Managing Director",
		bg: "#fef3c7",
		text: "#b45309",
		border: "#f59e0b",
		ring: "#fbbf24"
	},
	co_founder: {
		label: "Co-Founder",
		bg: "#fef3c7",
		text: "#b45309",
		border: "#f59e0b",
		ring: "#fbbf24"
	},
	vertical_head: {
		label: "Vertical Head",
		bg: "#f3e8ff",
		text: "#7e22ce",
		border: "#a855f7",
		ring: "#c084fc"
	},
	revenue_growth_manager: {
		label: "Revenue Growth Manager",
		bg: "#dbeafe",
		text: "#1d4ed8",
		border: "#3b82f6",
		ring: "#60a5fa"
	},
	manager: {
		label: "Manager",
		bg: "#dbeafe",
		text: "#1d4ed8",
		border: "#3b82f6",
		ring: "#60a5fa"
	},
	team_lead: {
		label: "Team Lead",
		bg: "#ccfbf1",
		text: "#0f766e",
		border: "#14b8a6",
		ring: "#2dd4bf"
	},
	team_leader: {
		label: "Team Leader",
		bg: "#ccfbf1",
		text: "#0f766e",
		border: "#14b8a6",
		ring: "#2dd4bf"
	},
	employee: {
		label: "Associate",
		bg: "#f1f5f9",
		text: "#475569",
		border: "#cbd5e1",
		ring: "#94a3b8"
	},
	admin: {
		label: "Admin",
		bg: "#fee2e2",
		text: "#b91c1c",
		border: "#ef4444",
		ring: "#f87171"
	},
	hr: {
		label: "HR",
		bg: "#d1fae5",
		text: "#047857",
		border: "#10b981",
		ring: "#34d399"
	},
	hr_executive: {
		label: "HR Executive",
		bg: "#d1fae5",
		text: "#047857",
		border: "#10b981",
		ring: "#34d399"
	}
};
function getRoleBadge(role) {
	if (role && ROLE_BADGES[role]) return ROLE_BADGES[role];
	const clean = String(role || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
	if (ROLE_BADGES[clean]) return ROLE_BADGES[clean];
	if (clean.includes("director") || clean.includes("founder")) return ROLE_BADGES.managing_director;
	if (clean.includes("head")) return ROLE_BADGES.vertical_head;
	if (clean.includes("manager")) return ROLE_BADGES.manager;
	if (clean.includes("lead")) return ROLE_BADGES.team_lead;
	if (clean.includes("hr")) return ROLE_BADGES.hr;
	if (clean.includes("admin")) return ROLE_BADGES.admin;
	return {
		label: role ? role.replace(/_/g, " ") : "Unassigned",
		bg: "#f1f5f9",
		text: "#475569",
		border: "#cbd5e1",
		ring: "#94a3b8"
	};
}
var DEPT_COLORS = {
	"Executive Leadership": {
		border: "#8b5cf6",
		badge: "#ede9fe",
		text: "#6d28d9",
		dot: "#7c3aed"
	},
	Executive: {
		border: "#8b5cf6",
		badge: "#ede9fe",
		text: "#6d28d9",
		dot: "#7c3aed"
	},
	"Revenue Growth": {
		border: "#f59e0b",
		badge: "#fef3c7",
		text: "#b45309",
		dot: "#f59e0b"
	},
	Operations: {
		border: "#06b6d4",
		badge: "#cffafe",
		text: "#0e7490",
		dot: "#06b6d4"
	},
	Technology: {
		border: "#2563eb",
		badge: "#dbeafe",
		text: "#1d4ed8",
		dot: "#3b82f6"
	},
	"Human Resources": {
		border: "#10b981",
		badge: "#d1fae5",
		text: "#047857",
		dot: "#10b981"
	}
};
function getDeptStyle(department) {
	return DEPT_COLORS[department] || {
		border: "#64748b",
		badge: "#f1f5f9",
		text: "#475569",
		dot: "#64748b"
	};
}
function EmployeeAvatar({ name, size = 44, deptStyle }) {
	const initials = String(name ?? "?").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			width: size,
			height: size,
			minWidth: size,
			borderRadius: "50%",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontWeight: 700,
			fontSize: size >= 40 ? "14px" : "11px",
			backgroundColor: deptStyle?.badge || "var(--surface-sunken)",
			color: deptStyle?.text || "var(--foreground)",
			border: `2px solid ${deptStyle?.border || "var(--border)"}`,
			boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
		},
		children: initials
	});
}
function OrgNodeCard({ node, isSelected, isInChain, isCollapsed, onToggleCollapse, onSelect }) {
	const deptStyle = getDeptStyle(node.department);
	const hasChildren = node.children && node.children.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: `node-${node.id}`,
		onClick: () => onSelect(node),
		style: {
			width: "280px",
			borderRadius: "12px",
			backgroundColor: "var(--surface)",
			border: isSelected ? `2px solid ${deptStyle.border}` : isInChain ? "2px dashed #3b82f6" : "1px solid var(--border)",
			boxShadow: isSelected ? `0 0 0 4px ${deptStyle.badge}, 0 8px 24px rgba(0,0,0,0.12)` : "0 4px 12px rgba(0,0,0,0.04)",
			cursor: "pointer",
			position: "relative",
			transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
			padding: "14px",
			display: "flex",
			flexDirection: "column",
			gap: "10px",
			userSelect: "none"
		},
		className: "org-node-card",
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
						gap: "6px",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								fontWeight: 700,
								padding: "3px 8px",
								borderRadius: "999px",
								backgroundColor: deptStyle.badge,
								color: deptStyle.text,
								letterSpacing: "0.02em",
								textTransform: "uppercase"
							},
							children: node.department || "General"
						}),
						node.role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 700,
								padding: "2px 7px",
								borderRadius: "6px",
								backgroundColor: getRoleBadge(node.role).bg,
								color: getRoleBadge(node.role).text,
								border: `1px solid ${getRoleBadge(node.role).border}`,
								letterSpacing: "0.02em"
							},
							children: getRoleBadge(node.role).label
						}),
						node.team && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 700,
								padding: "2px 7px",
								borderRadius: "6px",
								backgroundColor: "#f3e8ff",
								color: "#7e22ce",
								border: "1px solid #d8b4fe",
								letterSpacing: "0.02em"
							},
							children: node.team
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "5px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: node.status === "active" ? "#10b981" : "#f59e0b"
						},
						title: node.status || "Active"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "10px",
							color: "var(--muted)",
							fontWeight: 600
						},
						children: node.status === "active" ? "Active" : node.status
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
					name: node.name,
					deptStyle,
					size: 46
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						minWidth: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 700,
								fontSize: "14px",
								color: "var(--foreground)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: node.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12px",
								color: "var(--muted)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
								marginTop: "1px"
							},
							children: node.designation || "Pending Designation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "10px",
								color: "var(--muted)",
								marginTop: "2px",
								fontWeight: 500
							},
							children: node.employeeId
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderTop: "1px solid var(--border)",
					paddingTop: "8px",
					marginTop: "2px",
					fontSize: "11px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px",
						color: "var(--muted)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 12 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--foreground)" },
							children: node.directReportCount || 0
						}), " direct"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: "var(--border)" },
							children: "•"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--foreground)" },
							children: node.totalTeamCount || 0
						}), " team"] })
					]
				}), hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: (e) => {
						e.stopPropagation();
						onToggleCollapse(node.id);
					},
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: "4px",
						padding: "3px 8px",
						fontSize: "10px",
						fontWeight: 700,
						borderRadius: "6px",
						border: "1px solid var(--border)",
						backgroundColor: isCollapsed ? "var(--surface-sunken)" : "var(--surface)",
						color: isCollapsed ? "var(--primary)" : "var(--muted)",
						cursor: "pointer",
						transition: "all 0.15s ease"
					},
					title: isCollapsed ? "Expand direct reports" : "Collapse direct reports",
					children: [isCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: node.children.length })]
				})]
			})
		]
	});
}
function OrgTreeBranch({ node, selectedId, chainSet, collapsedMap, onToggleCollapse, onSelect }) {
	const isSelected = String(node.id) === String(selectedId);
	const isInChain = chainSet.has(String(node.id));
	const isCollapsed = Boolean(collapsedMap[node.id]);
	const hasChildren = node.children && node.children.length > 0 && !isCollapsed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgNodeCard, {
				node,
				isSelected,
				isInChain,
				isCollapsed,
				onToggleCollapse,
				onSelect
			}),
			hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
				width: "2px",
				height: "24px",
				backgroundColor: isInChain ? "#006e6f" : "var(--border)",
				transition: "background-color 0.2s ease"
			} }),
			hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					position: "relative"
				},
				children: node.children.map((child, idx) => {
					const isFirst = idx === 0;
					const isLast = idx === node.children.length - 1;
					const isSingle = node.children.length === 1;
					const childInChain = chainSet.has(String(child.id));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							position: "relative",
							padding: "0 16px"
						},
						children: [
							!isSingle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!isFirst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								position: "absolute",
								top: 0,
								left: 0,
								right: "50%",
								height: "2px",
								backgroundColor: childInChain && isInChain ? "#006e6f" : "var(--border)"
							} }), !isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								position: "absolute",
								top: 0,
								left: "50%",
								right: 0,
								height: "2px",
								backgroundColor: "var(--border)"
							} })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								width: "2px",
								height: "24px",
								backgroundColor: childInChain ? "#006e6f" : "var(--border)",
								transition: "background-color 0.2s ease"
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgTreeBranch, {
								node: child,
								selectedId,
								chainSet,
								collapsedMap,
								onToggleCollapse,
								onSelect
							})
						]
					}, child.id);
				})
			})
		]
	});
}
function ChangeManagerModal({ employee, allEmployees, isOpen, onClose, onSave }) {
	const [selectedMgrId, setSelectedMgrId] = (0, import_react.useState)(employee?.managerId || "");
	const [searchFilter, setSearchFilter] = (0, import_react.useState)("");
	const [showAllEmployees, setShowAllEmployees] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSelectedMgrId(employee?.managerId || "");
		setSearchFilter("");
		setError("");
	}, [employee, isOpen]);
	if (!isOpen || !employee) return null;
	const currentManager = allEmployees.find((m) => String(m.id || m._id) === String(employee.managerId));
	const rolePriority = {
		managing_director: 1,
		director: 1,
		co_founder: 1,
		vertical_head: 2,
		revenue_growth_manager: 3,
		manager: 3,
		team_lead: 4,
		team_leader: 4,
		admin: 5,
		hr: 6
	};
	const availableManagers = allEmployees.filter((m) => {
		if (m.id === employee.id || m._id === employee.id) return false;
		if (m.status !== "active") return false;
		if (showAllEmployees) return true;
		const r = (m.role || "").toLowerCase().trim();
		const d = (m.designation || "").toLowerCase().trim();
		return [
			"managing_director",
			"director",
			"co_founder",
			"vertical_head",
			"revenue_growth_manager",
			"manager",
			"team_lead",
			"team_leader",
			"admin",
			"hr"
		].includes(r) || d.includes("lead") || d.includes("manager") || d.includes("head") || d.includes("director") || d.includes("founder") || d.includes("vp") || d.includes("chief");
	}).filter((m) => {
		if (!searchFilter.trim()) return true;
		const q = searchFilter.toLowerCase();
		return (m.name || "").toLowerCase().includes(q) || (m.employeeId || "").toLowerCase().includes(q) || (m.designation || "").toLowerCase().includes(q) || (m.department || "").toLowerCase().includes(q);
	}).sort((a, b) => {
		const pa = rolePriority[(a.role || "").toLowerCase()] || 99;
		const pb = rolePriority[(b.role || "").toLowerCase()] || 99;
		if (pa !== pb) return pa - pb;
		return (a.name || "").localeCompare(b.name || "");
	});
	async function handleSubmit(e) {
		e.preventDefault();
		if (saving) return;
		setError("");
		setSaving(true);
		try {
			if (selectedMgrId) {
				const val = hrStore.validateManagerAssignment(employee.id, selectedMgrId);
				if (!val.valid) {
					setError(val.message);
					return;
				}
			}
			await onSave(employee.id, selectedMgrId || null);
			onClose();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			backgroundColor: "rgba(15, 23, 42, 0.75)",
			backdropFilter: "blur(6px)",
			zIndex: 99999,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				width: "100%",
				maxWidth: "540px",
				backgroundColor: "#ffffff",
				borderRadius: "16px",
				border: "1px solid #e2e8f0",
				boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
				padding: "24px",
				display: "flex",
				flexDirection: "column",
				gap: "16px",
				color: "#0f172a"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							fontSize: "18px",
							fontWeight: 700,
							margin: 0,
							color: "#0f172a"
						},
						children: "Change Reporting Manager"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "13px",
							color: "#64748b",
							margin: "4px 0 0 0"
						},
						children: [
							"Reassign reporting line for ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#0f172a" },
								children: employee.name
							}),
							" (",
							employee.designation || "Staff",
							")"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
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
						backgroundColor: "#f1f5f9",
						borderRadius: "10px",
						padding: "10px 14px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						fontSize: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							color: "#64748b",
							fontWeight: 600
						},
						children: "Current Manager:"
					}), currentManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontWeight: 700,
							color: "#0f172a"
						},
						children: [
							currentManager.name,
							" (",
							currentManager.designation || currentManager.department,
							")"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontWeight: 600,
							color: "#0284c7"
						},
						children: "Top-Level (Company Root / No Manager)"
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "12px 14px",
						backgroundColor: "#fee2e2",
						color: "#b91c1c",
						borderRadius: "8px",
						fontSize: "13px",
						display: "flex",
						alignItems: "flex-start",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						size: 16,
						style: {
							marginTop: "2px",
							flexShrink: 0
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "16px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									color: "#334155"
								},
								children: "Select New Reporting Manager"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									fontSize: "11px",
									color: "#64748b",
									display: "flex",
									alignItems: "center",
									gap: "4px",
									cursor: "pointer"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showAllEmployees,
									onChange: (e) => setShowAllEmployees(e.target.checked)
								}), "Show all staff"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Search manager by name, title, or department...",
							value: searchFilter,
							onChange: (e) => setSearchFilter(e.target.value),
							style: {
								width: "100%",
								padding: "8px 12px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "12px",
								marginBottom: "8px",
								boxSizing: "border-box"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: selectedMgrId,
							onChange: (e) => {
								setSelectedMgrId(e.target.value);
								setError("");
							},
							size: 6,
							style: {
								width: "100%",
								padding: "6px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								backgroundColor: "#ffffff",
								fontSize: "13px",
								color: "#0f172a",
								boxSizing: "border-box"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								style: {
									padding: "6px 8px",
									fontWeight: 600,
									color: "#0284c7"
								},
								children: "⭐ None (Promote to Top-Level Company Root)"
							}), availableManagers.map((mgr) => {
								const val = hrStore.validateManagerAssignment(employee.id, mgr.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: mgr.id,
									disabled: !val.valid,
									style: {
										padding: "6px 8px",
										color: !val.valid ? "#94a3b8" : "#0f172a",
										backgroundColor: !val.valid ? "#f8fafc" : "#ffffff"
									},
									children: [
										mgr.name,
										" — ",
										mgr.designation || "Staff",
										" (",
										mgr.department,
										") ",
										!val.valid ? "⛔ (Circular Loop)" : ""
									]
								}, mgr.id);
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								display: "block",
								fontSize: "11px",
								color: "#64748b",
								marginTop: "6px"
							},
							children: [
								"Subordinates in ",
								employee.name,
								"'s reporting line are automatically blocked to prevent circular loops."
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: "10px",
							marginTop: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							style: {
								padding: "8px 16px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								background: "#f8fafc",
								color: "#334155",
								fontSize: "13px",
								fontWeight: 600,
								cursor: "pointer"
							},
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: saving,
							className: "ui-button primary",
							style: {
								padding: "8px 20px",
								fontSize: "13px",
								fontWeight: 600
							},
							children: saving ? "Updating..." : "Confirm Manager Change"
						})]
					})]
				})
			]
		})
	});
}
function TransferDepartmentModal({ employee, allEmployees, isOpen, onClose, onSave }) {
	const [department, setDepartment] = (0, import_react.useState)(employee?.department || "Technology");
	const [squad, setSquad] = (0, import_react.useState)(employee?.squad || employee?.team || "");
	const [designation, setDesignation] = (0, import_react.useState)(employee?.designation || "");
	const [managerId, setManagerId] = (0, import_react.useState)(employee?.managerId || "");
	const [error, setError] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (employee) {
			setDepartment(employee.department || "Technology");
			setSquad(employee.squad || employee.team || "");
			setDesignation(employee.designation || "");
			setManagerId(employee.managerId || "");
			setError("");
		}
	}, [employee, isOpen]);
	const departments = (0, import_react.useMemo)(() => {
		const names = (hrStore.getDepartments ? hrStore.getDepartments() : []).map((d) => typeof d === "string" ? d : d.name).filter(Boolean);
		allEmployees.forEach((e) => {
			if (e.department && !names.includes(e.department)) names.push(e.department);
		});
		return Array.from(new Set(names)).sort();
	}, [allEmployees]);
	const squads = (0, import_react.useMemo)(() => {
		const names = (hrStore.getTeams ? hrStore.getTeams() : []).map((t) => typeof t === "string" ? t : t.name).filter(Boolean);
		allEmployees.forEach((e) => {
			if (e.squad && !names.includes(e.squad)) names.push(e.squad);
			if (e.team && !names.includes(e.team)) names.push(e.team);
		});
		return Array.from(new Set(names)).sort();
	}, [allEmployees]);
	if (!isOpen || !employee) return null;
	async function handleSubmit(e) {
		e.preventDefault();
		if (saving) return;
		setError("");
		setSaving(true);
		try {
			if (managerId) {
				const val = hrStore.validateManagerAssignment(employee.id, managerId);
				if (!val.valid) {
					setError(val.message);
					return;
				}
			}
			await onSave(employee.id, department, managerId || null, {
				squad,
				designation
			});
			onClose();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			backgroundColor: "rgba(15, 23, 42, 0.75)",
			backdropFilter: "blur(6px)",
			zIndex: 99999,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				width: "100%",
				maxWidth: "520px",
				backgroundColor: "#ffffff",
				borderRadius: "16px",
				border: "1px solid #e2e8f0",
				boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
				padding: "24px",
				display: "flex",
				flexDirection: "column",
				gap: "16px",
				color: "#0f172a"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							fontSize: "18px",
							fontWeight: 700,
							margin: 0,
							color: "#0f172a"
						},
						children: "Transfer Department & Squad"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "13px",
							color: "#64748b",
							margin: "4px 0 0 0"
						},
						children: [
							"Transfer ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#0f172a" },
								children: employee.name
							}),
							" to a different department or team"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						style: {
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#64748b"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "12px 14px",
						backgroundColor: "#fee2e2",
						color: "#b91c1c",
						borderRadius: "8px",
						fontSize: "13px",
						display: "flex",
						alignItems: "flex-start",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						size: 16,
						style: {
							marginTop: "2px",
							flexShrink: 0
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "12px",
								fontWeight: 600,
								marginBottom: "4px",
								color: "#334155"
							},
							children: "Target Department *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: department,
							onChange: (e) => setDepartment(e.target.value),
							style: {
								width: "100%",
								padding: "9px 12px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								backgroundColor: "#ffffff",
								fontSize: "13px",
								color: "#0f172a",
								boxSizing: "border-box"
							},
							children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: d,
								children: d
							}, d))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										display: "block",
										fontSize: "12px",
										fontWeight: 600,
										marginBottom: "4px",
										color: "#334155"
									},
									children: "Squad / Team"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									list: "transfer-squad-list",
									value: squad,
									onChange: (e) => setSquad(e.target.value),
									placeholder: "e.g. Core Dev, Growth",
									style: {
										width: "100%",
										padding: "9px 12px",
										borderRadius: "8px",
										border: "1px solid #cbd5e1",
										fontSize: "13px",
										color: "#0f172a",
										boxSizing: "border-box"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
									id: "transfer-squad-list",
									children: squads.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s }, s))
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 600,
									marginBottom: "4px",
									color: "#334155"
								},
								children: "Designation / Title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: designation,
								onChange: (e) => setDesignation(e.target.value),
								placeholder: "e.g. SDE, Lead",
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									fontSize: "13px",
									color: "#0f172a",
									boxSizing: "border-box"
								}
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "12px",
								fontWeight: 600,
								marginBottom: "4px",
								color: "#334155"
							},
							children: "Reporting Manager in New Department (Optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: managerId,
							onChange: (e) => setManagerId(e.target.value),
							style: {
								width: "100%",
								padding: "9px 12px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								backgroundColor: "#ffffff",
								fontSize: "13px",
								color: "#0f172a",
								boxSizing: "border-box"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Keep current manager / None"
							}), allEmployees.filter((m) => m.id !== employee.id && m._id !== employee.id && m.status === "active").map((mgr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: mgr.id,
								children: [
									mgr.name,
									" — ",
									mgr.designation || "Staff",
									" (",
									mgr.department,
									")"
								]
							}, mgr.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								marginTop: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onClose,
								style: {
									padding: "8px 16px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									background: "#f8fafc",
									color: "#334155",
									fontSize: "13px",
									fontWeight: 600,
									cursor: "pointer"
								},
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: saving,
								className: "ui-button primary",
								style: {
									padding: "8px 20px",
									fontSize: "13px",
									fontWeight: 600
								},
								children: saving ? "Saving..." : "Confirm Transfer"
							})]
						})
					]
				})
			]
		})
	});
}
function EditPositionModal({ employee, allEmployees, isOpen, onClose, onSave }) {
	const [designation, setDesignation] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("employee");
	const [squad, setSquad] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("Ignite Campus");
	const [status, setStatus] = (0, import_react.useState)("active");
	const [employmentType, setEmploymentType] = (0, import_react.useState)("full_time");
	const [error, setError] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (employee) {
			setDesignation(employee.designation || "");
			setRole(employee.role || "employee");
			setSquad(employee.squad || employee.team || "");
			setLocation(employee.location || employee.campus || "Ignite Campus");
			setStatus(employee.status || "active");
			setEmploymentType(employee.employmentType || "full_time");
			setError("");
		}
	}, [employee, isOpen]);
	if (!isOpen || !employee) return null;
	const roles = [
		{
			value: "employee",
			label: "Employee (Individual Contributor)"
		},
		{
			value: "team_leader",
			label: "Team Leader / Lead"
		},
		{
			value: "manager",
			label: "Manager"
		},
		{
			value: "revenue_growth_manager",
			label: "Revenue Growth Manager"
		},
		{
			value: "vertical_head",
			label: "Vertical Head / Director"
		},
		{
			value: "hr",
			label: "HR / People Operations"
		},
		{
			value: "admin",
			label: "System Administrator"
		}
	];
	const squads = (0, import_react.useMemo)(() => {
		const names = (hrStore.getTeams ? hrStore.getTeams() : []).map((t) => typeof t === "string" ? t : t.name).filter(Boolean);
		allEmployees.forEach((e) => {
			if (e.squad && !names.includes(e.squad)) names.push(e.squad);
			if (e.team && !names.includes(e.team)) names.push(e.team);
		});
		return Array.from(new Set(names)).sort();
	}, [allEmployees]);
	async function handleSubmit(e) {
		e.preventDefault();
		if (saving) return;
		if (!designation.trim()) {
			setError("Designation is required.");
			return;
		}
		setError("");
		setSaving(true);
		try {
			await onSave(employee.id, {
				designation: designation.trim(),
				role,
				squad: squad.trim(),
				team: squad.trim(),
				location: location.trim(),
				campus: location.trim(),
				status,
				employmentType
			});
			onClose();
		} catch (err) {
			setError(err.message || "Failed to update position details.");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			backgroundColor: "rgba(15, 23, 42, 0.75)",
			backdropFilter: "blur(6px)",
			zIndex: 99999,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				width: "100%",
				maxWidth: "520px",
				backgroundColor: "#ffffff",
				borderRadius: "16px",
				border: "1px solid #e2e8f0",
				boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
				padding: "24px",
				display: "flex",
				flexDirection: "column",
				gap: "16px",
				color: "#0f172a"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							fontSize: "18px",
							fontWeight: 700,
							margin: 0,
							color: "#0f172a"
						},
						children: "Edit Position & Details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "13px",
							color: "#64748b",
							margin: "4px 0 0 0"
						},
						children: ["Update title, role, squad & campus for ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "#0f172a" },
							children: employee.name
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						style: {
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#64748b"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "12px 14px",
						backgroundColor: "#fee2e2",
						color: "#b91c1c",
						borderRadius: "8px",
						fontSize: "13px",
						display: "flex",
						alignItems: "flex-start",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						size: 16,
						style: {
							marginTop: "2px",
							flexShrink: 0
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "12px",
								fontWeight: 600,
								marginBottom: "4px",
								color: "#334155"
							},
							children: "Job Title / Designation *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							required: true,
							value: designation,
							onChange: (e) => setDesignation(e.target.value),
							placeholder: "e.g. SDE, Senior Engineer, Product Designer",
							style: {
								width: "100%",
								padding: "9px 12px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13px",
								color: "#0f172a",
								boxSizing: "border-box"
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 600,
									marginBottom: "4px",
									color: "#334155"
								},
								children: "System Access Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: role,
								onChange: (e) => setRole(e.target.value),
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									backgroundColor: "#ffffff",
									fontSize: "13px",
									color: "#0f172a",
									boxSizing: "border-box"
								},
								children: roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r.value,
									children: r.label
								}, r.value))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										display: "block",
										fontSize: "12px",
										fontWeight: 600,
										marginBottom: "4px",
										color: "#334155"
									},
									children: "Squad / Team"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									list: "pos-squad-list",
									value: squad,
									onChange: (e) => setSquad(e.target.value),
									placeholder: "e.g. Core Dev, Growth, Ops",
									style: {
										width: "100%",
										padding: "9px 12px",
										borderRadius: "8px",
										border: "1px solid #cbd5e1",
										fontSize: "13px",
										color: "#0f172a",
										boxSizing: "border-box"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
									id: "pos-squad-list",
									children: squads.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s }, s))
								})
							] })]
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
									fontSize: "12px",
									fontWeight: 600,
									marginBottom: "4px",
									color: "#334155"
								},
								children: "Campus / Location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: location,
								onChange: (e) => setLocation(e.target.value),
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									backgroundColor: "#ffffff",
									fontSize: "13px",
									color: "#0f172a",
									boxSizing: "border-box"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Ignite Campus",
										children: "Ignite Campus"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Velocity Hub",
										children: "Velocity Hub"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Headquarters",
										children: "Headquarters"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Remote",
										children: "Remote"
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 600,
									marginBottom: "4px",
									color: "#334155"
								},
								children: "Employment Status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: status,
								onChange: (e) => setStatus(e.target.value),
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									backgroundColor: "#ffffff",
									fontSize: "13px",
									color: "#0f172a",
									boxSizing: "border-box"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "active",
										children: "Active"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "on_leave",
										children: "On Leave"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "probation",
										children: "Probation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "inactive",
										children: "Inactive"
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								marginTop: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onClose,
								style: {
									padding: "8px 16px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									background: "#f8fafc",
									color: "#334155",
									fontSize: "13px",
									fontWeight: 600,
									cursor: "pointer"
								},
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: saving,
								className: "ui-button primary",
								style: {
									padding: "8px 20px",
									fontSize: "13px",
									fontWeight: 600
								},
								children: saving ? "Saving..." : "Save Changes"
							})]
						})
					]
				})
			]
		})
	});
}
function QuickAddEmployeeModal({ allEmployees, defaultManagerId, isOpen, onClose, onCreated }) {
	const [activeTab, setActiveTab] = (0, import_react.useState)("basic");
	const [formData, setFormData] = (0, import_react.useState)({
		name: "",
		email: "",
		phone: "",
		designation: "",
		department: "Technology",
		managerId: defaultManagerId || "",
		status: "active",
		location: "",
		employmentType: "Full-time",
		joiningDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		salary: "0",
		aadharNumber: "",
		aadharDoc: "",
		panTaxId: "",
		panDoc: "",
		passportNumber: "",
		passportDoc: "",
		hasExistingUan: false,
		uanNumber: "",
		uanDoc: "",
		bankName: "",
		accountNumber: "",
		ifscCode: "",
		cancelledCheque: "",
		ugMarksheets: "",
		pgMarksheets: "",
		degreeCertificates: "",
		passportPhoto: "",
		fatherName: "",
		motherName: "",
		parentPhone: "",
		parentAddress: "",
		emergencyContactName: "",
		emergencyRelation: "",
		emergencyPhone: ""
	});
	const [error, setError] = (0, import_react.useState)("");
	const departments = (0, import_react.useMemo)(() => {
		const names = (hrStore.getDepartments ? hrStore.getDepartments() : []).map((d) => typeof d === "string" ? d : d.name).filter(Boolean);
		allEmployees.forEach((e) => {
			if (e.department && !names.includes(e.department)) names.push(e.department);
		});
		return Array.from(new Set(names)).sort();
	}, [allEmployees]);
	(0, import_react.useEffect)(() => {
		if (defaultManagerId) setFormData((prev) => ({
			...prev,
			managerId: defaultManagerId
		}));
	}, [defaultManagerId]);
	if (!isOpen) return null;
	function handleFile(field, e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setFormData((prev) => ({
			...prev,
			[field]: reader.result
		}));
		reader.readAsDataURL(file);
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		if (!formData.name || !formData.email || !formData.designation) {
			setError("Please provide Name, Work Email, and Designation.");
			return;
		}
		try {
			const mgr = allEmployees.find((m) => m.id === formData.managerId || m._id === formData.managerId);
			onCreated(await hrStore.addEmployee({
				...formData,
				managerName: mgr ? mgr.name : null,
				salary: Number(formData.salary) || 0,
				bankDetails: {
					bankName: formData.bankName,
					accountNumber: formData.accountNumber,
					ifscCode: formData.ifscCode,
					panTaxId: formData.panTaxId,
					uanNumber: formData.hasExistingUan ? formData.uanNumber : ""
				},
				parentsContact: {
					fatherName: formData.fatherName,
					motherName: formData.motherName,
					phone: formData.parentPhone,
					address: formData.parentAddress
				},
				emergencyContact: {
					name: formData.emergencyContactName,
					relationship: formData.emergencyRelation,
					phone: formData.emergencyPhone
				},
				identity: {
					aadharNumber: formData.aadharNumber,
					panNumber: formData.panTaxId,
					passportNumber: formData.passportNumber,
					hasExistingUan: formData.hasExistingUan,
					uanNumber: formData.hasExistingUan ? formData.uanNumber : ""
				},
				documents: {
					passportPhoto: formData.passportPhoto,
					uanDoc: formData.uanDoc,
					aadharDoc: formData.aadharDoc,
					panDoc: formData.panDoc,
					ugMarksheets: formData.ugMarksheets,
					pgMarksheets: formData.pgMarksheets,
					degreeCertificates: formData.degreeCertificates,
					cancelledCheque: formData.cancelledCheque,
					passportDoc: formData.passportDoc
				}
			}));
			onClose();
		} catch (err) {
			setError(err.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			backgroundColor: "rgba(15, 23, 42, 0.75)",
			backdropFilter: "blur(6px)",
			zIndex: 99999,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				width: "100%",
				maxWidth: "740px",
				maxHeight: "92vh",
				backgroundColor: "#ffffff",
				borderRadius: "16px",
				border: "1px solid #e2e8f0",
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				color: "#0f172a"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "16px 20px",
						borderBottom: "1px solid #e2e8f0"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							fontSize: "18px",
							fontWeight: 700,
							margin: 0,
							color: "#0f172a"
						},
						children: "Add Employee to Organization"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						style: {
							color: "#64748b",
							fontSize: "11px"
						},
						children: "Register employee, reporting relationship, statutory IDs & onboarding documents."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						style: {
							background: "transparent",
							border: 0,
							fontSize: "18px",
							cursor: "pointer",
							color: "#64748b"
						},
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: "4px",
						background: "#f8fafc",
						padding: "6px 16px",
						borderBottom: "1px solid #e2e8f0",
						overflowX: "auto"
					},
					children: [
						{
							key: "basic",
							label: "1. Basic & Role"
						},
						{
							key: "identity",
							label: "2. Identity & UAN"
						},
						{
							key: "bank",
							label: "3. Bank Details"
						},
						{
							key: "education",
							label: "4. Education & Marksheets"
						},
						{
							key: "family",
							label: "5. Family & Photo"
						}
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setActiveTab(t.key),
						style: {
							padding: "6px 12px",
							fontSize: "11px",
							fontWeight: activeTab === t.key ? 700 : 500,
							borderRadius: "6px",
							border: 0,
							background: activeTab === t.key ? "#fff" : "transparent",
							color: activeTab === t.key ? "#0284c7" : "#64748b",
							boxShadow: activeTab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
							cursor: "pointer",
							whiteSpace: "nowrap"
						},
						children: t.label
					}, t.key))
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#b91c1c",
						padding: "10px 16px",
						fontSize: "12px"
					},
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "flex",
						flexDirection: "column",
						flex: 1,
						overflow: "hidden"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							flex: 1,
							overflowY: "auto",
							padding: "20px",
							display: "flex",
							flexDirection: "column",
							gap: "14px"
						},
						children: [
							activeTab === "basic" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Full Name *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										placeholder: "e.g. Jordan Miller",
										value: formData.name,
										onChange: (e) => setFormData({
											...formData,
											name: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Work Email *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "email",
										required: true,
										placeholder: "jordan.miller@edufyi.local",
										value: formData.email,
										onChange: (e) => setFormData({
											...formData,
											email: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Department *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: formData.department,
										onChange: (e) => setFormData({
											...formData,
											department: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										},
										children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: d,
											children: d
										}, d))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Designation *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										placeholder: "e.g. Frontend Engineer",
										value: formData.designation,
										onChange: (e) => setFormData({
											...formData,
											designation: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Reporting Manager"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: formData.managerId,
										onChange: (e) => setFormData({
											...formData,
											managerId: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "No manager (Top level)"
										}), allEmployees.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: m.id,
											children: [
												m.name,
												" (",
												m.department,
												")"
											]
										}, m.id))]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Annual CTC (₹)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: "0",
										value: formData.salary,
										onChange: (e) => setFormData({
											...formData,
											salary: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								})
							] }),
							activeTab === "identity" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Aadhar Card Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "12-digit number",
										value: formData.aadharNumber,
										onChange: (e) => setFormData({
											...formData,
											aadharNumber: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											marginBottom: "6px"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											fontSize: "11px",
											color: "#0284c7",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload Aadhar Card" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: ".pdf,.jpg,.png",
												onChange: (e) => handleFile("aadharDoc", e),
												style: { display: "none" }
											}),
											formData.aadharDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#10b981",
													fontWeight: 700
												},
												children: "✓ Attached"
											})
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "PAN Card Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "10-digit PAN",
										value: formData.panTaxId,
										onChange: (e) => setFormData({
											...formData,
											panTaxId: e.target.value.toUpperCase()
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											marginBottom: "6px"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											fontSize: "11px",
											color: "#0284c7",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload PAN Card" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: ".pdf,.jpg,.png",
												onChange: (e) => handleFile("panDoc", e),
												style: { display: "none" }
											}),
											formData.panDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#10b981",
													fontWeight: 700
												},
												children: "✓ Attached"
											})
										]
									})
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px",
									marginTop: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Passport Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Passport number",
										value: formData.passportNumber,
										onChange: (e) => setFormData({
											...formData,
											passportNumber: e.target.value.toUpperCase()
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											marginBottom: "6px"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											fontSize: "11px",
											color: "#0284c7",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload Passport" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: ".pdf,.jpg,.png",
												onChange: (e) => handleFile("passportDoc", e),
												style: { display: "none" }
											}),
											formData.passportDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#10b981",
													fontWeight: 700
												},
												children: "✓ Attached"
											})
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: "#f8fafc",
										padding: "12px",
										borderRadius: "8px",
										border: "1px solid #e2e8f0"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											fontSize: "12px",
											fontWeight: 600,
											cursor: "pointer"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: formData.hasExistingUan,
											onChange: (e) => setFormData({
												...formData,
												hasExistingUan: e.target.checked
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Already has UAN (EPF)?" })]
									}), formData.hasExistingUan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "12-digit UAN",
										value: formData.uanNumber,
										onChange: (e) => setFormData({
											...formData,
											uanNumber: e.target.value
										}),
										style: {
											width: "100%",
											padding: "6px 8px",
											fontSize: "11px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											marginTop: "6px"
										}
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											fontSize: "11px",
											color: "#0284c7",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "4px",
											marginTop: "6px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload UAN Card / Passbook" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: ".pdf,.jpg,.png,image/*",
												onChange: (e) => handleFile("uanDoc", e),
												style: { display: "none" }
											}),
											formData.uanDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#10b981",
													fontWeight: 700
												},
												children: "✓ Attached"
											})
										]
									})] })]
								})]
							})] }),
							activeTab === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "#475569",
										display: "block",
										marginBottom: "4px"
									},
									children: "Bank Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "e.g. HDFC Bank",
									value: formData.bankName,
									onChange: (e) => setFormData({
										...formData,
										bankName: e.target.value
									}),
									style: {
										width: "100%",
										padding: "8px 10px",
										fontSize: "12px",
										borderRadius: "6px",
										border: "1px solid #cbd5e1"
									}
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "#475569",
										display: "block",
										marginBottom: "4px"
									},
									children: "Account Number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "e.g. 5010049281923",
									value: formData.accountNumber,
									onChange: (e) => setFormData({
										...formData,
										accountNumber: e.target.value
									}),
									style: {
										width: "100%",
										padding: "8px 10px",
										fontSize: "12px",
										borderRadius: "6px",
										border: "1px solid #cbd5e1"
									}
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px",
									marginTop: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "#475569",
										display: "block",
										marginBottom: "4px"
									},
									children: "IFSC Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "e.g. HDFC0001234",
									value: formData.ifscCode,
									onChange: (e) => setFormData({
										...formData,
										ifscCode: e.target.value.toUpperCase()
									}),
									style: {
										width: "100%",
										padding: "8px 10px",
										fontSize: "12px",
										borderRadius: "6px",
										border: "1px solid #cbd5e1"
									}
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										justifyContent: "center"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											fontSize: "11px",
											color: "#0284c7",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload Cancelled Cheque" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: ".pdf,.jpg,.png",
												onChange: (e) => handleFile("cancelledCheque", e),
												style: { display: "none" }
											}),
											formData.cancelledCheque && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#10b981",
													fontWeight: 700
												},
												children: "✓ Attached"
											})
										]
									})
								})]
							})] }),
							activeTab === "education" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "14px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#f8fafc",
											padding: "12px",
											borderRadius: "8px",
											border: "1px solid #e2e8f0"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "12px",
												display: "block",
												marginBottom: "6px"
											},
											children: "UG Marksheets"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												fontSize: "11px",
												color: "#0284c7",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "4px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload UG Marksheets" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: ".pdf,.jpg,.png",
													onChange: (e) => handleFile("ugMarksheets", e),
													style: { display: "none" }
												}),
												formData.ugMarksheets && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														color: "#10b981",
														fontWeight: 700
													},
													children: "✓ Attached"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#f8fafc",
											padding: "12px",
											borderRadius: "8px",
											border: "1px solid #e2e8f0"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "12px",
												display: "block",
												marginBottom: "6px"
											},
											children: "PG Marksheets"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												fontSize: "11px",
												color: "#0284c7",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "4px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload PG Marksheets" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: ".pdf,.jpg,.png",
													onChange: (e) => handleFile("pgMarksheets", e),
													style: { display: "none" }
												}),
												formData.pgMarksheets && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														color: "#10b981",
														fontWeight: 700
													},
													children: "✓ Attached"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											gridColumn: "span 2",
											background: "#f8fafc",
											padding: "12px",
											borderRadius: "8px",
											border: "1px solid #e2e8f0"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "12px",
												display: "block",
												marginBottom: "6px"
											},
											children: "Degree Certificates"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												fontSize: "11px",
												color: "#0284c7",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "4px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload Degree Certificates" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: ".pdf,.jpg,.png",
													onChange: (e) => handleFile("degreeCertificates", e),
													style: { display: "none" }
												}),
												formData.degreeCertificates && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														color: "#10b981",
														fontWeight: 700
													},
													children: "✓ Attached"
												})
											]
										})]
									})
								]
							}),
							activeTab === "family" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: {
												fontSize: "11px",
												fontWeight: 600,
												color: "#475569",
												display: "block",
												marginBottom: "4px"
											},
											children: "Passport Photo"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												fontSize: "11px",
												color: "#0284c7",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "4px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📎 Upload Photo" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: ".jpg,.jpeg,.png",
													onChange: (e) => handleFile("passportPhoto", e),
													style: { display: "none" }
												}),
												formData.passportPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														color: "#10b981",
														fontWeight: 700
													},
													children: "✓ Photo Attached"
												})
											]
										}),
										formData.passportPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: formData.passportPhoto,
											alt: "Passport preview",
											style: {
												width: "48px",
												height: "48px",
												borderRadius: "6px",
												objectFit: "cover",
												marginTop: "6px"
											}
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Emergency Contact Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Contact name",
										value: formData.emergencyContactName,
										onChange: (e) => setFormData({
											...formData,
											emergencyContactName: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Emergency Relationship"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "e.g. Father, Spouse, Sibling",
										value: formData.emergencyRelation,
										onChange: (e) => setFormData({
											...formData,
											emergencyRelation: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Emergency Contact Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "tel",
										inputMode: "tel",
										placeholder: "+91 98765 43210 (Digits only)",
										value: formData.emergencyPhone,
										onChange: (e) => setFormData({
											...formData,
											emergencyPhone: e.target.value.replace(/[^0-9+\s\-()]/g, "")
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Father's Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Father's name",
										value: formData.fatherName,
										onChange: (e) => setFormData({
											...formData,
											fatherName: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Mother's Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Mother's name",
										value: formData.motherName,
										onChange: (e) => setFormData({
											...formData,
											motherName: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Parents Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "tel",
										inputMode: "tel",
										placeholder: "+91 98765 11111 (Digits only)",
										value: formData.parentPhone,
										onChange: (e) => setFormData({
											...formData,
											parentPhone: e.target.value.replace(/[^0-9+\s\-()]/g, "")
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#475569",
											display: "block",
											marginBottom: "4px"
										},
										children: "Parents Address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Residential address",
										value: formData.parentAddress,
										onChange: (e) => setFormData({
											...formData,
											parentAddress: e.target.value
										}),
										style: {
											width: "100%",
											padding: "8px 10px",
											fontSize: "12px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1"
										}
									})] })]
								})
							] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							padding: "14px 20px",
							borderTop: "1px solid #e2e8f0",
							background: "#f8fafc"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							style: {
								padding: "8px 16px",
								fontSize: "12px",
								fontWeight: 600,
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								background: "#fff",
								cursor: "pointer"
							},
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							style: {
								padding: "8px 20px",
								fontSize: "12px",
								fontWeight: 700,
								borderRadius: "8px",
								border: 0,
								background: "#0284c7",
								color: "#fff",
								cursor: "pointer"
							},
							children: "Add to Hierarchy"
						})]
					})]
				})
			]
		})
	});
}
function OrgOutlineBranch({ node, level = 0, selectedId, collapsedMap, onToggleCollapse, onSelect }) {
	const isSelected = String(node.id) === String(selectedId);
	const isCollapsed = Boolean(collapsedMap[node.id]);
	const hasChildren = node.children && node.children.length > 0;
	const deptStyle = getDeptStyle(node.department);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "6px"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: () => onSelect(node),
			style: {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: "10px",
				padding: "10px 14px",
				marginLeft: `${Math.min(level * 14, 42)}px`,
				backgroundColor: isSelected ? deptStyle.badge : "var(--surface)",
				border: isSelected ? `2px solid ${deptStyle.border}` : "1px solid var(--border)",
				borderRadius: "10px",
				cursor: "pointer",
				transition: "all 0.15s ease"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "10px",
					minWidth: 0,
					flex: 1
				},
				children: [
					hasChildren ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							onToggleCollapse(node.id);
						},
						style: {
							width: "28px",
							height: "28px",
							borderRadius: "6px",
							border: "1px solid var(--border)",
							background: "var(--surface-sunken)",
							display: "grid",
							placeItems: "center",
							cursor: "pointer",
							flexShrink: 0
						},
						title: isCollapsed ? "Expand reports" : "Collapse reports",
						children: isCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 14 })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						width: "28px",
						flexShrink: 0
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
						name: node.name,
						size: 34,
						deptStyle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							minWidth: 0,
							flex: 1
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								overflow: "hidden"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "13px",
									fontWeight: 700,
									color: "var(--foreground)",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								},
								children: node.name
							}), node.role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "9px",
									fontWeight: 700,
									padding: "1px 6px",
									borderRadius: "5px",
									backgroundColor: getRoleBadge(node.role).bg,
									color: getRoleBadge(node.role).text,
									border: `1px solid ${getRoleBadge(node.role).border}`,
									whiteSpace: "nowrap"
								},
								children: getRoleBadge(node.role).label
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: [
								node.designation,
								" • ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										color: deptStyle.text,
										fontWeight: 600
									},
									children: node.department
								})
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "6px",
					flexShrink: 0
				},
				children: [hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "10px",
						fontWeight: 700,
						padding: "2px 6px",
						borderRadius: "4px",
						background: "var(--surface-sunken)",
						color: "var(--muted)"
					},
					children: [node.children.length, " reports"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
					size: 14,
					style: { color: "var(--muted)" }
				})]
			})]
		}), hasChildren && !isCollapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: "6px"
			},
			children: node.children.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgOutlineBranch, {
				node: child,
				level: level + 1,
				selectedId,
				collapsedMap,
				onToggleCollapse,
				onSelect
			}, child.id))
		})]
	});
}
function OrgHierarchyPage() {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(hrStore.getState());
	const [selectedNode, setSelectedNode] = (0, import_react.useState)(null);
	const [viewMode, setViewMode] = (0, import_react.useState)("canvas");
	const [departmentFilter, setDepartmentFilter] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [activeViewerId, setActiveViewerId] = (0, import_react.useState)("");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [collapsedMap, setCollapsedMap] = (0, import_react.useState)({});
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [pan, setPan] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [isPanning, setIsPanning] = (0, import_react.useState)(false);
	const [startPan, setStartPan] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const [changeMgrModalOpen, setChangeMgrModalOpen] = (0, import_react.useState)(false);
	const [transferDeptModalOpen, setTransferDeptModalOpen] = (0, import_react.useState)(false);
	const [editDetailsModalOpen, setEditDetailsModalOpen] = (0, import_react.useState)(false);
	const [addEmpModalOpen, setAddEmpModalOpen] = (0, import_react.useState)(false);
	const [addEmpDefaultManagerId, setAddEmpDefaultManagerId] = (0, import_react.useState)("");
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState({ ...state });
		});
	}, []);
	const isHRorAdmin = user?.role === "admin" || user?.role === "hr";
	const allEmployees = storeState.employees || [];
	const canManageEmployees = isHRorAdmin;
	const effectiveViewer = (0, import_react.useMemo)(() => {
		if (canManageEmployees) {
			if (activeViewerId) return allEmployees.find((e) => String(e.id || e._id) === activeViewerId || e.employeeId === activeViewerId) || null;
			return null;
		}
		return allEmployees.find((e) => user?.id && (String(e.id) === String(user.id) || String(e._id) === String(user.id)) || user?.employeeId && (e.employeeId === user.employeeId || e.id === user.employeeId) || user?.email && e.email && e.email.toLowerCase() === user.email.toLowerCase()) || user || null;
	}, [
		canManageEmployees,
		activeViewerId,
		allEmployees,
		user
	]);
	const { roots, stats, scoped, chain, reportingLine, targetEmployee, allowedIds } = (0, import_react.useMemo)(() => {
		return hrStore.getOrganizationHierarchy(null, departmentFilter || null, effectiveViewer);
	}, [
		storeState.employees,
		departmentFilter,
		effectiveViewer
	]);
	const allowedIdSet = (0, import_react.useMemo)(() => {
		if (!scoped || !allowedIds) return null;
		return new Set(allowedIds.map(String));
	}, [scoped, allowedIds]);
	const reportingChain = (0, import_react.useMemo)(() => {
		if (!selectedNode) return [];
		return hrStore.getEmployeeReportingChain(selectedNode.id);
	}, [selectedNode, storeState.employees]);
	const chainSet = (0, import_react.useMemo)(() => {
		return new Set(reportingChain.map((item) => String(item.id || item._id)));
	}, [reportingChain]);
	const directReports = (0, import_react.useMemo)(() => {
		if (!selectedNode) return [];
		return hrStore.getDirectReports(selectedNode.id);
	}, [selectedNode, storeState.employees]);
	(0, import_react.useEffect)(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			setSearchOpen(false);
			return;
		}
		const q = searchQuery.toLowerCase().trim();
		const matches = (allowedIdSet ? allEmployees.filter((e) => allowedIdSet.has(String(e.id || e._id))) : allEmployees).filter((e) => e.name.toLowerCase().includes(q) || e.employeeId && e.employeeId.toLowerCase().includes(q) || e.designation && e.designation.toLowerCase().includes(q) || e.department && e.department.toLowerCase().includes(q));
		setSearchResults(matches.slice(0, 8));
		setSearchOpen(true);
	}, [
		searchQuery,
		allEmployees,
		allowedIdSet
	]);
	function showNotification(msg) {
		setFeedback(msg);
		setTimeout(() => setFeedback(""), 4500);
	}
	const handleSelectEmployee = (0, import_react.useCallback)((node) => {
		setSelectedNode(node);
		const chain = hrStore.getEmployeeReportingChain(node.id);
		setCollapsedMap((prev) => {
			const next = { ...prev };
			chain.forEach((c) => {
				delete next[c.id];
			});
			return next;
		});
	}, []);
	function handleSearchResultClick(emp) {
		setSearchQuery("");
		setSearchOpen(false);
		handleSelectEmployee(emp);
		setTimeout(() => {
			const el = document.getElementById(`node-${emp.id}`);
			if (el) el.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center"
			});
		}, 150);
	}
	function handleToggleCollapse(nodeId) {
		setCollapsedMap((prev) => ({
			...prev,
			[nodeId]: !prev[nodeId]
		}));
	}
	function handleExpandAll() {
		setCollapsedMap({});
		showNotification("Expanded all hierarchy branches.");
	}
	function handleCollapseAll() {
		const next = {};
		allEmployees.forEach((e) => {
			next[e.id] = true;
		});
		setCollapsedMap(next);
		showNotification("Collapsed branches to executive root.");
	}
	function handleZoomIn() {
		setZoom((z) => Math.min(1.6, z + .15));
	}
	function handleZoomOut() {
		setZoom((z) => Math.max(.4, z - .15));
	}
	function handleResetView() {
		setZoom(1);
		setPan({
			x: 0,
			y: 0
		});
	}
	function handleFitScreen() {
		setZoom(.85);
		setPan({
			x: 0,
			y: 0
		});
	}
	function handleMouseDown(e) {
		if (e.target.closest(".org-node-card") || e.target.closest("button") || e.target.closest("input")) return;
		setIsPanning(true);
		setStartPan({
			x: e.clientX - pan.x,
			y: e.clientY - pan.y
		});
	}
	function handleMouseMove(e) {
		if (!isPanning) return;
		setPan({
			x: e.clientX - startPan.x,
			y: e.clientY - startPan.y
		});
	}
	function handleMouseUp() {
		setIsPanning(false);
	}
	async function handleSaveManager(employeeId, newManagerId) {
		try {
			const updated = await hrStore.updateEmployeeManager(employeeId, newManagerId, user?.displayName || user?.name || "Admin");
			showNotification(`Successfully updated reporting manager for ${updated?.name || "employee"}.`);
			if (updated) setSelectedNode(updated);
		} catch (err) {
			showNotification(`Failed to update manager: ${err.message}`);
		}
	}
	async function handleSaveDepartmentTransfer(employeeId, newDepartment, newManagerId, extra = {}) {
		try {
			const updated = await hrStore.transferEmployeeDepartment(employeeId, newDepartment, newManagerId, user?.displayName || user?.name || "Admin", extra);
			showNotification(`Transferred ${updated?.name || "employee"} to department ${newDepartment}.`);
			if (updated) setSelectedNode(updated);
		} catch (err) {
			showNotification(`Failed to transfer department: ${err.message}`);
		}
	}
	async function handleSavePositionDetails(employeeId, updates) {
		try {
			const updated = await hrStore.updateEmployee(employeeId, updates);
			showNotification(`Updated position details for ${updated?.name || "employee"}.`);
			if (updated) setSelectedNode(updated);
		} catch (err) {
			showNotification(`Failed to update position details: ${err.message}`);
		}
	}
	function handleEmployeeCreated(newEmp) {
		showNotification(`Added ${newEmp.name} to ${newEmp.department} department.`);
		handleSelectEmployee(newEmp);
	}
	const deptStyle = selectedNode ? getDeptStyle(selectedNode.department) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			height: "100%",
			minHeight: "calc(100vh - 120px)"
		},
		children: [
			feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					position: "fixed",
					top: "80px",
					right: "24px",
					backgroundColor: "#0f172a",
					color: "#ffffff",
					padding: "12px 20px",
					borderRadius: "10px",
					fontSize: "13px",
					fontWeight: 600,
					boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
					zIndex: 9999,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					size: 16,
					style: { color: "#10b981" }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: feedback })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "16px",
					marginBottom: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								color: "var(--primary)",
								backgroundColor: "var(--surface-sunken)",
								padding: "3px 8px",
								borderRadius: "6px"
							},
							children: "Enterprise Architecture"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						style: {
							fontSize: "24px",
							fontWeight: 800,
							margin: "6px 0 2px 0",
							letterSpacing: "-0.02em"
						},
						children: "Organization Hierarchy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "13px",
							color: "var(--muted)",
							margin: 0
						},
						children: "Visual organizational reporting structure, reporting lines & department workforce breakdown"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "12px"
					},
					children: [isHRorAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setAddEmpDefaultManagerId("");
							setAddEmpModalOpen(true);
						},
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							backgroundColor: "var(--primary)",
							color: "#ffffff",
							border: "none",
							borderRadius: "10px",
							padding: "9px 16px",
							fontSize: "13px",
							fontWeight: 600,
							cursor: "pointer",
							boxShadow: "0 2px 6px rgba(0, 102, 204, 0.25)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add Staff to Org" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "16px",
							backgroundColor: "var(--surface)",
							border: "1px solid var(--border)",
							borderRadius: "10px",
							padding: "6px 16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									fontWeight: 600,
									textTransform: "uppercase"
								},
								children: "Total Staff"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "16px",
									fontWeight: 800
								},
								children: stats.totalEmployees || 0
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								width: "1px",
								height: "24px",
								backgroundColor: "var(--border)"
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									fontWeight: 600,
									textTransform: "uppercase"
								},
								children: "Departments"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "16px",
									fontWeight: 800
								},
								children: stats.totalDepartments || 0
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								width: "1px",
								height: "24px",
								backgroundColor: "var(--border)"
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									fontWeight: 600,
									textTransform: "uppercase"
								},
								children: "Active Rate"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "16px",
									fontWeight: 800,
									color: "#10b981"
								},
								children: [stats.totalEmployees ? Math.round(stats.activeEmployees / stats.totalEmployees * 100) : 100, "%"]
							})] })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
					backgroundColor: "var(--surface)",
					border: "1px solid var(--border)",
					borderRadius: "12px",
					padding: "10px 14px",
					marginBottom: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "10px",
						flex: 1,
						minWidth: "300px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								width: "280px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 15,
									style: {
										position: "absolute",
										left: "10px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: searchQuery,
									onChange: (e) => setSearchQuery(e.target.value),
									placeholder: "Search employee, ID, designation...",
									style: {
										width: "100%",
										padding: "7px 12px 7px 32px",
										borderRadius: "8px",
										border: "1px solid var(--border)",
										backgroundColor: "var(--surface-sunken)",
										fontSize: "12px",
										color: "var(--foreground)"
									}
								}),
								searchOpen && searchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										position: "absolute",
										top: "100%",
										left: 0,
										right: 0,
										marginTop: "4px",
										backgroundColor: "var(--surface)",
										border: "1px solid var(--border)",
										borderRadius: "10px",
										boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
										zIndex: 200,
										maxHeight: "260px",
										overflowY: "auto"
									},
									children: searchResults.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => handleSearchResultClick(emp),
										style: {
											padding: "8px 12px",
											cursor: "pointer",
											borderBottom: "1px solid var(--border)",
											display: "flex",
											alignItems: "center",
											gap: "10px"
										},
										className: "search-item-hover",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
											name: emp.name,
											size: 30,
											deptStyle: getDeptStyle(emp.department)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												flex: 1,
												minWidth: 0
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: "13px",
													fontWeight: 600
												},
												children: emp.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													fontSize: "11px",
													color: "var(--muted)"
												},
												children: [
													emp.designation,
													" • ",
													emp.department
												]
											})]
										})]
									}, emp.id))
								})
							]
						}),
						canManageEmployees && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: departmentFilter,
							onChange: (e) => setDepartmentFilter(e.target.value),
							style: {
								padding: "7px 12px",
								borderRadius: "8px",
								border: "1px solid var(--border)",
								backgroundColor: "var(--surface-sunken)",
								fontSize: "12px",
								fontWeight: 600,
								color: "var(--foreground)",
								cursor: "pointer"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Full Company (All Departments)"
							}), hrStore.getDepartments().map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: dept.name,
								children: [
									dept.name,
									" ",
									dept.head && dept.head !== "Unassigned" ? `(${dept.head})` : ""
								]
							}, dept.id || dept.name))]
						}),
						canManageEmployees && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, {
								size: 14,
								style: { color: activeViewerId ? "#0284c7" : "var(--muted)" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: activeViewerId,
								onChange: (e) => setActiveViewerId(e.target.value),
								title: "Preview Org Tree scoped exactly as this role/employee sees it",
								style: {
									padding: "7px 12px",
									borderRadius: "8px",
									border: activeViewerId ? "1px solid #0284c7" : "1px solid var(--border)",
									backgroundColor: activeViewerId ? "rgba(2, 132, 199, 0.08)" : "var(--surface-sunken)",
									fontSize: "12px",
									fontWeight: 600,
									color: activeViewerId ? "#0284c7" : "var(--foreground)",
									cursor: "pointer",
									maxWidth: "240px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Scope: Full Org (Admin/HR View)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
										label: "Simulate as Managing Director / Executive",
										children: allEmployees.filter((e) => [
											"managing_director",
											"director",
											"co_founder"
										].includes(e.role)).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: e.id,
											children: [e.displayName || e.name, " (Managing Director)"]
										}, e.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
										label: "Simulate as Department Managers",
										children: allEmployees.filter((e) => e.role === "manager").map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: e.id,
											children: [
												e.name,
												" (",
												e.department,
												" Mgr)"
											]
										}, e.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
										label: "Simulate as Team Leads",
										children: allEmployees.filter((e) => e.role === "team_lead" || e.role === "team_leader" || /lead|leader|tl/i.test(e.role)).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: e.id,
											children: [
												e.name,
												" (TL - ",
												e.department,
												")"
											]
										}, e.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
										label: "Simulate as Employees / Staff",
										children: allEmployees.filter((e) => e.role === "employee").slice(0, 10).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: e.id,
											children: [
												e.name,
												" (",
												e.department,
												")"
											]
										}, e.id))
									})
								]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "inline-flex",
								background: "var(--surface-sunken)",
								borderRadius: "8px",
								padding: "2px",
								border: "1px solid var(--border)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setViewMode("canvas"),
								style: {
									padding: "5px 10px",
									borderRadius: "6px",
									border: "none",
									background: viewMode === "canvas" ? "var(--surface)" : "transparent",
									color: viewMode === "canvas" ? "var(--primary)" : "var(--muted)",
									fontWeight: 700,
									fontSize: "11px",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Canvas" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setViewMode("outline"),
								style: {
									padding: "5px 10px",
									borderRadius: "6px",
									border: "none",
									background: viewMode === "outline" ? "var(--surface)" : "transparent",
									color: viewMode === "outline" ? "var(--primary)" : "var(--muted)",
									fontWeight: 700,
									fontSize: "11px",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Network, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tree List" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleExpandAll,
							style: {
								padding: "6px 12px",
								borderRadius: "7px",
								border: "1px solid var(--border)",
								backgroundColor: "transparent",
								fontSize: "12px",
								fontWeight: 600,
								cursor: "pointer",
								color: "var(--foreground)"
							},
							children: "Expand All"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleCollapseAll,
							style: {
								padding: "6px 12px",
								borderRadius: "7px",
								border: "1px solid var(--border)",
								backgroundColor: "transparent",
								fontSize: "12px",
								fontWeight: 600,
								cursor: "pointer",
								color: "var(--foreground)"
							},
							children: "Collapse All"
						}),
						viewMode === "canvas" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								width: "1px",
								height: "20px",
								backgroundColor: "var(--border)",
								margin: "0 4px"
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleZoomIn,
								title: "Zoom In",
								style: {
									padding: "6px 8px",
									borderRadius: "7px",
									border: "1px solid var(--border)",
									backgroundColor: "transparent",
									cursor: "pointer",
									color: "var(--foreground)",
									display: "flex",
									alignItems: "center"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { size: 15 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleZoomOut,
								title: "Zoom Out",
								style: {
									padding: "6px 8px",
									borderRadius: "7px",
									border: "1px solid var(--border)",
									backgroundColor: "transparent",
									cursor: "pointer",
									color: "var(--foreground)",
									display: "flex",
									alignItems: "center"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { size: 15 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleFitScreen,
								title: "Fit to Screen",
								style: {
									padding: "6px 8px",
									borderRadius: "7px",
									border: "1px solid var(--border)",
									backgroundColor: "transparent",
									cursor: "pointer",
									color: "var(--foreground)",
									display: "flex",
									alignItems: "center"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { size: 15 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleResetView,
								title: "Reset View",
								style: {
									padding: "6px 8px",
									borderRadius: "7px",
									border: "1px solid var(--border)",
									backgroundColor: "transparent",
									cursor: "pointer",
									color: "var(--foreground)",
									display: "flex",
									alignItems: "center"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 15 })
							})
						] })
					]
				})]
			}),
			scoped && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					backgroundColor: "var(--surface)",
					border: "1px solid #0284c7",
					borderLeft: "4px solid #0284c7",
					borderRadius: "10px",
					padding: "12px 18px",
					marginBottom: "16px",
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
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "36px",
							height: "36px",
							borderRadius: "8px",
							backgroundColor: "rgba(2, 132, 199, 0.12)",
							color: "#0284c7",
							display: "grid",
							placeItems: "center",
							flexShrink: 0
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 20 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: "13px",
							fontWeight: 800,
							color: "var(--foreground)"
						},
						children: ["Role-Scoped Hierarchy View Active", targetEmployee && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontWeight: 600,
								color: "#0284c7",
								marginLeft: "6px"
							},
							children: [
								"— Viewing as: ",
								targetEmployee.name,
								" (",
								targetEmployee.designation || "Pending Designation",
								")"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "11px",
							color: "var(--muted)",
							marginTop: "2px"
						},
						children: Array.isArray(reportingLine) && reportingLine.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Upward Line: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: reportingLine.join(" ➔ ") })] }) : typeof reportingLine === "string" && reportingLine.trim().length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Upward Line: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: reportingLine })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Visibility restricted strictly to upward management chain & direct squad reports." })
					})] })]
				}), canManageEmployees && activeViewerId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setActiveViewerId(""),
					style: {
						fontSize: "11px",
						fontWeight: 700,
						padding: "6px 12px",
						borderRadius: "6px",
						border: "1px solid var(--border)",
						backgroundColor: "var(--surface-sunken)",
						color: "var(--foreground)",
						cursor: "pointer"
					},
					children: "Reset to Full Organization View"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flex: 1,
					position: "relative",
					overflow: "hidden",
					borderRadius: "14px",
					border: "1px solid var(--border)",
					backgroundColor: "var(--surface-sunken)",
					minHeight: "520px"
				},
				children: [viewMode === "outline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						padding: "20px 16px",
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: "10px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								fontWeight: 700,
								color: "var(--muted)",
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								marginBottom: "4px"
							},
							children: "Company Reporting Tree (Expandable Levels)"
						}),
						roots.map((rootNode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgOutlineBranch, {
							node: rootNode,
							level: 0,
							selectedId: selectedNode?.id,
							collapsedMap,
							onToggleCollapse: handleToggleCollapse,
							onSelect: handleSelectEmployee
						}, rootNode.id)),
						roots.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "30px",
								textAlign: "center",
								color: "var(--muted)",
								background: "var(--surface)",
								borderRadius: "10px"
							},
							children: "No employees match the current filter."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: canvasRef,
					onMouseDown: handleMouseDown,
					onMouseMove: handleMouseMove,
					onMouseUp: handleMouseUp,
					onMouseLeave: handleMouseUp,
					style: {
						flex: 1,
						overflow: "auto",
						position: "relative",
						cursor: isPanning ? "grabbing" : "grab",
						padding: "60px 40px",
						display: "flex",
						justifyContent: "safe center",
						backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px), radial-gradient(var(--border) 1px, transparent 1px)",
						backgroundSize: "24px 24px",
						backgroundPosition: "0 0, 12px 12px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
							transformOrigin: "top center",
							transition: isPanning ? "none" : "transform 0.15s ease-out",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "40px",
							minWidth: "max-content",
							width: "fit-content",
							margin: "0 auto",
							padding: "0 120px"
						},
						children: [roots.map((rootNode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgTreeBranch, {
							node: rootNode,
							selectedId: selectedNode?.id,
							chainSet,
							collapsedMap,
							onToggleCollapse: handleToggleCollapse,
							onSelect: handleSelectEmployee
						}, rootNode.id)), roots.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "40px",
								textAlign: "center",
								color: "var(--muted)",
								backgroundColor: "var(--surface)",
								borderRadius: "12px",
								border: "1px solid var(--border)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
									size: 32,
									style: {
										marginBottom: "8px",
										color: "var(--primary)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "No employees match the current filter" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										fontSize: "13px",
										margin: "4px 0 16px 0"
									},
									children: "Try resetting the department filter to view the complete organizational tree."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button",
									onClick: () => setDepartmentFilter(""),
									children: "View Complete Organization"
								})
							]
						})]
					})
				}), selectedNode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "org-details-drawer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "20px",
							borderBottom: "1px solid var(--border)",
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
								name: selectedNode.name,
								size: 54,
								deptStyle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										fontSize: "17px",
										fontWeight: 800,
										margin: 0
									},
									children: selectedNode.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "12px",
										color: "var(--muted)",
										marginTop: "2px"
									},
									children: selectedNode.designation
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px",
										marginTop: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											padding: "2px 8px",
											borderRadius: "4px",
											backgroundColor: deptStyle?.badge,
											color: deptStyle?.text
										},
										children: selectedNode.department
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											padding: "2px 6px",
											borderRadius: "4px",
											backgroundColor: "var(--surface-sunken)",
											color: "var(--muted)"
										},
										children: selectedNode.employeeId
									})]
								})
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSelectedNode(null),
							style: {
								background: "none",
								border: "none",
								cursor: "pointer",
								color: "var(--muted)",
								padding: "4px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "20px",
							display: "flex",
							flexDirection: "column",
							gap: "16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px",
									backgroundColor: "var(--surface-sunken)",
									padding: "12px",
									borderRadius: "10px",
									fontSize: "12px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "11px",
											display: "block"
										},
										children: "Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: selectedNode.status === "active" ? "#10b981" : "#f59e0b" },
										children: selectedNode.status || "Active"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "11px",
											display: "block"
										},
										children: "Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedNode.employmentType || "Full-time" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "11px",
											display: "block"
										},
										children: "Location"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { fontWeight: 600 },
										children: selectedNode.location || selectedNode.campus || "Headquarters"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "11px",
											display: "block"
										},
										children: "Squad / Team"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { fontWeight: 600 },
										children: selectedNode.squad || selectedNode.team || "General"
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
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
										color: "var(--muted)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--foreground)" },
										children: selectedNode.email
									})]
								}), selectedNode.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										color: "var(--muted)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--foreground)" },
										children: selectedNode.phone
									})]
								})]
							}),
							isHRorAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									borderTop: "1px solid var(--border)",
									paddingTop: "16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										textTransform: "uppercase",
										color: "var(--muted)",
										marginBottom: "10px",
										letterSpacing: "0.04em",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hierarchy Management" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											color: "var(--primary)",
											fontWeight: 600
										},
										children: "Admin Controls"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "8px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setChangeMgrModalOpen(true),
											title: "Change reporting line / Move in tree",
											style: {
												display: "flex",
												flexDirection: "column",
												alignItems: "flex-start",
												gap: "4px",
												padding: "10px 12px",
												borderRadius: "8px",
												border: "1px solid var(--border)",
												backgroundColor: "var(--surface)",
												cursor: "pointer",
												textAlign: "left",
												transition: "all 0.15s ease"
											},
											onMouseEnter: (e) => {
												e.currentTarget.style.borderColor = "var(--primary)";
												e.currentTarget.style.backgroundColor = "var(--surface-sunken)";
											},
											onMouseLeave: (e) => {
												e.currentTarget.style.borderColor = "var(--border)";
												e.currentTarget.style.backgroundColor = "var(--surface)";
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "var(--primary)",
													fontWeight: 700,
													fontSize: "12px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitFork, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Move / Manager" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--muted)"
												},
												children: "Change reporting line"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setTransferDeptModalOpen(true),
											title: "Transfer employee to another department or squad",
											style: {
												display: "flex",
												flexDirection: "column",
												alignItems: "flex-start",
												gap: "4px",
												padding: "10px 12px",
												borderRadius: "8px",
												border: "1px solid var(--border)",
												backgroundColor: "var(--surface)",
												cursor: "pointer",
												textAlign: "left",
												transition: "all 0.15s ease"
											},
											onMouseEnter: (e) => {
												e.currentTarget.style.borderColor = "var(--primary)";
												e.currentTarget.style.backgroundColor = "var(--surface-sunken)";
											},
											onMouseLeave: (e) => {
												e.currentTarget.style.borderColor = "var(--border)";
												e.currentTarget.style.backgroundColor = "var(--surface)";
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#8b5cf6",
													fontWeight: 700,
													fontSize: "12px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Transfer Dept" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--muted)"
												},
												children: "Dept & squad directory"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setEditDetailsModalOpen(true),
											title: "Quick edit designation, role, squad & campus",
											style: {
												display: "flex",
												flexDirection: "column",
												alignItems: "flex-start",
												gap: "4px",
												padding: "10px 12px",
												borderRadius: "8px",
												border: "1px solid var(--border)",
												backgroundColor: "var(--surface)",
												cursor: "pointer",
												textAlign: "left",
												transition: "all 0.15s ease"
											},
											onMouseEnter: (e) => {
												e.currentTarget.style.borderColor = "var(--primary)";
												e.currentTarget.style.backgroundColor = "var(--surface-sunken)";
											},
											onMouseLeave: (e) => {
												e.currentTarget.style.borderColor = "var(--border)";
												e.currentTarget.style.backgroundColor = "var(--surface)";
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#f59e0b",
													fontWeight: 700,
													fontSize: "12px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit Position" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--muted)"
												},
												children: "Role, title & campus"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												setAddEmpDefaultManagerId(selectedNode.id);
												setAddEmpModalOpen(true);
											},
											title: "Add a subordinate reporting directly to this employee",
											style: {
												display: "flex",
												flexDirection: "column",
												alignItems: "flex-start",
												gap: "4px",
												padding: "10px 12px",
												borderRadius: "8px",
												border: "1px solid var(--border)",
												backgroundColor: "var(--surface)",
												cursor: "pointer",
												textAlign: "left",
												transition: "all 0.15s ease"
											},
											onMouseEnter: (e) => {
												e.currentTarget.style.borderColor = "var(--primary)";
												e.currentTarget.style.backgroundColor = "var(--surface-sunken)";
											},
											onMouseLeave: (e) => {
												e.currentTarget.style.borderColor = "var(--border)";
												e.currentTarget.style.backgroundColor = "var(--surface)";
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#10b981",
													fontWeight: 700,
													fontSize: "12px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add Report" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--muted)"
												},
												children: "Onboard direct report"
											})]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									borderTop: "1px solid var(--border)",
									paddingTop: "16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "12px",
										fontWeight: 700,
										textTransform: "uppercase",
										color: "var(--muted)",
										marginBottom: "10px",
										letterSpacing: "0.04em"
									},
									children: "Reporting Chain"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: "6px"
									},
									children: reportingChain.map((chainEmp, idx) => {
										const isCurrent = String(chainEmp.id || chainEmp._id) === String(selectedNode.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											onClick: () => handleSelectEmployee(chainEmp),
											style: {
												display: "flex",
												alignItems: "center",
												gap: "10px",
												padding: "6px 10px",
												borderRadius: "8px",
												cursor: "pointer",
												backgroundColor: isCurrent ? "var(--surface-sunken)" : "transparent",
												border: isCurrent ? "1px solid var(--border)" : "1px solid transparent",
												fontWeight: isCurrent ? 700 : 500,
												fontSize: "12px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														color: "var(--muted)",
														fontSize: "10px",
														width: "14px"
													},
													children: [idx + 1, "."]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
													name: chainEmp.name,
													size: 24,
													deptStyle: getDeptStyle(chainEmp.department)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														flex: 1,
														minWidth: 0
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap"
														},
														children: chainEmp.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontSize: "10px",
															color: "var(--muted)"
														},
														children: chainEmp.designation
													})]
												}),
												isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														backgroundColor: "var(--primary)",
														color: "#fff",
														padding: "1px 6px",
														borderRadius: "4px"
													},
													children: "Selected"
												})
											]
										}, chainEmp.id || idx);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									borderTop: "1px solid var(--border)",
									paddingTop: "16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: "10px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "12px",
											fontWeight: 700,
											textTransform: "uppercase",
											color: "var(--muted)",
											letterSpacing: "0.04em"
										},
										children: [
											"Direct Reports (",
											directReports.length,
											")"
										]
									})
								}), directReports.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: "6px"
									},
									children: directReports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => handleSelectEmployee(report),
										style: {
											display: "flex",
											alignItems: "center",
											gap: "10px",
											padding: "8px 10px",
											borderRadius: "8px",
											border: "1px solid var(--border)",
											cursor: "pointer",
											backgroundColor: "var(--surface)",
											fontSize: "12px",
											transition: "background-color 0.15s ease"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
												name: report.name,
												size: 28,
												deptStyle: getDeptStyle(report.department)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													flex: 1,
													minWidth: 0
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														fontWeight: 600,
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap"
													},
													children: report.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														fontSize: "10px",
														color: "var(--muted)"
													},
													children: report.designation
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												size: 14,
												style: { color: "var(--muted)" }
											})
										]
									}, report.id))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "12px",
										color: "var(--muted)",
										fontStyle: "italic"
									},
									children: "Individual Contributor (no direct reports)."
								})]
							}),
							isHRorAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									borderTop: "1px solid var(--border)",
									paddingTop: "16px",
									display: "flex",
									flexDirection: "column",
									gap: "8px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `#/hr/people/${selectedNode.id}`,
									style: {
										width: "100%",
										padding: "8px 12px",
										borderRadius: "8px",
										border: "1px solid var(--border)",
										backgroundColor: "transparent",
										color: "var(--foreground)",
										fontSize: "12px",
										fontWeight: 600,
										textDecoration: "none",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: "6px",
										textAlign: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Complete Dossier" })]
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeManagerModal, {
				isOpen: changeMgrModalOpen,
				onClose: () => setChangeMgrModalOpen(false),
				employee: selectedNode,
				allEmployees,
				onSave: handleSaveManager
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransferDepartmentModal, {
				isOpen: transferDeptModalOpen,
				onClose: () => setTransferDeptModalOpen(false),
				employee: selectedNode,
				allEmployees,
				onSave: handleSaveDepartmentTransfer
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditPositionModal, {
				isOpen: editDetailsModalOpen,
				onClose: () => setEditDetailsModalOpen(false),
				employee: selectedNode,
				allEmployees,
				onSave: handleSavePositionDetails
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAddEmployeeModal, {
				isOpen: addEmpModalOpen,
				onClose: () => {
					setAddEmpModalOpen(false);
					setAddEmpDefaultManagerId("");
				},
				allEmployees,
				defaultManagerId: addEmpDefaultManagerId,
				onCreated: handleEmployeeCreated
			})
		]
	});
}
export { OrgHierarchyPage };
