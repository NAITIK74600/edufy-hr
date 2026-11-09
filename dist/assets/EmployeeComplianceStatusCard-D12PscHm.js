import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, A as ShieldCheck, Bt as Clock, Dt as FileText, Gt as CircleAlert, Mt as Eye, Wt as CircleCheck, _n as require_react, f as User, i as X } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { n as VERIFICATION_TEMPLATES } from "./OnboardingDossierView-Cbmslv9U.js";
import { r as COMPANY_POLICIES, t as COMPLIANCE_AND_NDA_TEMPLATES } from "./companyDocumentsConstants-DUkgikMQ.js";
// src/components/EmployeeComplianceStatusCard.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function EmployeeComplianceStatusCard({ employee }) {
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	const [filterStatus, setFilterStatus] = (0, import_react.useState)("all");
	const [viewingModal, setViewingModal] = (0, import_react.useState)(null);
	if (!employee) return null;
	const rawConsents = employee.policyConsents || employee.onboardingDocs?.policyConsents || {};
	const policyItems = COMPANY_POLICIES.map((p) => {
		const key = p.key || p.id;
		const consent = rawConsents[key] || rawConsents[p.id] || null;
		const isDone = Boolean(consent && consent.consented);
		return {
			type: "policy",
			id: key,
			title: p.title,
			category: p.category || "Company Policy",
			badge: p.badge || "Mandatory",
			description: p.description,
			isDone,
			statusLabel: isDone ? "Done" : "Pending",
			timestamp: consent?.consentedDateFormatted || (consent?.consentedAt ? new Date(consent.consentedAt).toLocaleString() : null),
			signedBy: consent?.consentedBy || employee.name,
			employeeId: consent?.employeeId || employee.employeeId,
			previewUrl: p.downloadUrl,
			fileName: p.fileName
		};
	});
	const complianceDocs = employee.complianceDocs || employee.onboardingDocs?.complianceDocs || employee.onboardingDocs || {};
	const ndaItems = [...COMPLIANCE_AND_NDA_TEMPLATES].map((t) => {
		const uploaded = complianceDocs[t.key] || complianceDocs[t.id] || null;
		const isDone = Boolean(uploaded && (uploaded.url || uploaded.fileName || uploaded.uploadedAt));
		return {
			type: "nda",
			id: t.key,
			title: t.title,
			category: t.category || "Compliance Agreement",
			badge: t.badge || "Legal Document",
			description: t.description,
			isDone,
			statusLabel: isDone ? "Done" : "Pending",
			uploadedFile: uploaded?.fileName || uploaded?.name || (isDone ? "Document Uploaded" : null),
			uploadDate: uploaded?.uploadedAt ? new Date(uploaded.uploadedAt).toLocaleDateString() : null,
			previewUrl: uploaded?.url || t.downloadUrl,
			templateUrl: t.downloadUrl,
			fileName: uploaded?.fileName || t.fileName,
			isEmployeeUploaded: Boolean(uploaded?.url)
		};
	});
	const onboardingDocs = employee.onboardingDocs || {};
	const verificationItems = VERIFICATION_TEMPLATES.map((v) => {
		const doc = onboardingDocs[v.key] || null;
		const isUploaded = Boolean(doc && (doc.url || doc.fileName || doc.submittedAt));
		const isVerified = Boolean(doc && doc.status === "verified");
		const isDone = isUploaded;
		return {
			type: "verification",
			id: v.key,
			title: v.title,
			category: v.category || "Verification Form",
			badge: v.badge || "HR Statutory",
			description: v.description,
			isDone,
			isVerified,
			statusLabel: isVerified ? "Verified" : isDone ? "Done" : "Pending",
			uploadedFile: doc?.fileName || (isDone ? "Form Submitted" : null),
			uploadDate: doc?.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : null,
			previewUrl: doc?.url || v.downloadUrl,
			fileName: doc?.fileName || v.fileName,
			isEmployeeUploaded: Boolean(doc?.url)
		};
	});
	const allItems = [
		...policyItems,
		...ndaItems,
		...verificationItems
	];
	const totalPolicies = policyItems.length;
	const completedPolicies = policyItems.filter((i) => i.isDone).length;
	const totalNda = ndaItems.length;
	const completedNda = ndaItems.filter((i) => i.isDone).length;
	const totalVerification = verificationItems.length;
	const completedVerification = verificationItems.filter((i) => i.isDone).length;
	const totalRequired = allItems.length;
	const totalCompleted = allItems.filter((i) => i.isDone).length;
	const totalPending = totalRequired - totalCompleted;
	const percentComplete = Math.round(totalCompleted / (totalRequired || 1) * 100);
	const filteredItems = (activeTab === "policies" ? policyItems : activeTab === "nda" ? ndaItems : activeTab === "verification" ? verificationItems : allItems).filter((item) => {
		if (filterStatus === "done") return item.isDone;
		if (filterStatus === "pending") return !item.isDone;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel",
		style: {
			padding: "24px",
			borderRadius: "12px",
			background: "#ffffff",
			border: "1px solid #cbd5e1",
			boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
			marginTop: "20px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					gap: "16px",
					flexWrap: "wrap",
					marginBottom: "20px",
					paddingBottom: "16px",
					borderBottom: "1px solid #f1f5f9"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "44px",
							height: "44px",
							borderRadius: "10px",
							background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
							color: "#ffffff",
							display: "grid",
							placeItems: "center",
							boxShadow: "0 4px 8px rgba(13, 148, 136, 0.25)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 24 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: 0,
								fontSize: "17px",
								fontWeight: 700,
								color: "#0f172a"
							},
							children: "Policy Consent, Document Policy & NDA Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10.5px",
								fontWeight: 700,
								padding: "2px 8px",
								borderRadius: "10px",
								background: "#f1f5f9",
								color: "#475569",
								border: "1px solid #cbd5e1",
								textTransform: "uppercase",
								letterSpacing: "0.4px"
							},
							children: "HR & Admin Only View"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							margin: "3px 0 0",
							fontSize: "12px",
							color: "#64748b"
						},
						children: [
							"Compliance tracking and legal policy consent record for ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.name }),
							" (",
							employee.employeeId || "ID Pending",
							")"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "8px 14px",
						borderRadius: "10px",
						background: percentComplete === 100 ? "#f0fdf4" : percentComplete > 50 ? "#fffbeb" : "#fef2f2",
						border: `1px solid ${percentComplete === 100 ? "#86efac" : percentComplete > 50 ? "#fde68a" : "#fecaca"}`
					},
					children: [percentComplete === 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						size: 18,
						style: { color: "#16a34a" }
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						size: 18,
						style: { color: percentComplete > 50 ? "#d97706" : "#dc2626" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "12px",
							fontWeight: 700,
							color: percentComplete === 100 ? "#15803d" : percentComplete > 50 ? "#b45309" : "#b91c1c"
						},
						children: percentComplete === 100 ? "100% Fully Compliant" : `${totalCompleted} of ${totalRequired} Done (${percentComplete}%)`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "10.5px",
							color: "#64748b"
						},
						children: totalPending > 0 ? `${totalPending} items pending completion` : "All policies & agreements signed"
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
					gap: "12px",
					marginBottom: "20px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => setActiveTab("policies"),
						style: {
							padding: "14px 16px",
							borderRadius: "10px",
							background: activeTab === "policies" ? "#f0fdfa" : "#f8fafc",
							border: activeTab === "policies" ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "#64748b"
									},
									children: "Policy Consents"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10.5px",
										fontWeight: 700,
										padding: "1px 6px",
										borderRadius: "6px",
										background: completedPolicies === totalPolicies ? "#dcfce7" : "#fef3c7",
										color: completedPolicies === totalPolicies ? "#15803d" : "#b45309"
									},
									children: completedPolicies === totalPolicies ? "Done" : `${totalPolicies - completedPolicies} Pending`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "18px",
									fontWeight: 800,
									color: "#0f172a"
								},
								children: [
									completedPolicies,
									" / ",
									totalPolicies
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "11px",
									color: "#64748b",
									marginTop: "2px"
								},
								children: "Code of conduct, attendance, sales & zero tolerance"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => setActiveTab("nda"),
						style: {
							padding: "14px 16px",
							borderRadius: "10px",
							background: activeTab === "nda" ? "#f0fdfa" : "#f8fafc",
							border: activeTab === "nda" ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "#64748b"
									},
									children: "Compliance & NDA"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10.5px",
										fontWeight: 700,
										padding: "1px 6px",
										borderRadius: "6px",
										background: completedNda === totalNda ? "#dcfce7" : "#fef3c7",
										color: completedNda === totalNda ? "#15803d" : "#b45309"
									},
									children: completedNda === totalNda ? "Done" : `${totalNda - completedNda} Pending`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "18px",
									fontWeight: 800,
									color: "#0f172a"
								},
								children: [
									completedNda,
									" / ",
									totalNda
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "11px",
									color: "#64748b",
									marginTop: "2px"
								},
								children: "Employee NDA, IP Assignment & Cybersecurity Code"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => setActiveTab("verification"),
						style: {
							padding: "14px 16px",
							borderRadius: "10px",
							background: activeTab === "verification" ? "#f0fdfa" : "#f8fafc",
							border: activeTab === "verification" ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "#64748b"
									},
									children: "Verification Forms"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10.5px",
										fontWeight: 700,
										padding: "1px 6px",
										borderRadius: "6px",
										background: completedVerification === totalVerification ? "#dcfce7" : "#fef3c7",
										color: completedVerification === totalVerification ? "#15803d" : "#b45309"
									},
									children: completedVerification === totalVerification ? "Done" : `${totalVerification - completedVerification} Pending`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "18px",
									fontWeight: 800,
									color: "#0f172a"
								},
								children: [
									completedVerification,
									" / ",
									totalVerification
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "11px",
									color: "#64748b",
									marginTop: "2px"
								},
								children: "Database, BGV undertaking, IRF, Court & Guardian forms"
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
					flexWrap: "wrap",
					marginBottom: "16px",
					paddingBottom: "12px",
					borderBottom: "1px solid #f1f5f9"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: "6px",
						flexWrap: "wrap"
					},
					children: [
						{
							id: "all",
							label: `All Requirements (${allItems.length})`
						},
						{
							id: "policies",
							label: `Company Policies (${completedPolicies}/${totalPolicies})`
						},
						{
							id: "nda",
							label: `Compliance & NDA (${completedNda}/${totalNda})`
						},
						{
							id: "verification",
							label: `Verification Forms (${completedVerification}/${totalVerification})`
						}
					].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setActiveTab(tab.id),
						style: {
							fontSize: "11.5px",
							fontWeight: activeTab === tab.id ? 700 : 500,
							padding: "6px 12px",
							borderRadius: "8px",
							border: activeTab === tab.id ? "1px solid #0d9488" : "1px solid #e2e8f0",
							background: activeTab === tab.id ? "#0d9488" : "#ffffff",
							color: activeTab === tab.id ? "#ffffff" : "#475569",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: tab.label
					}, tab.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11.5px",
							color: "#64748b",
							fontWeight: 600
						},
						children: "Filter:"
					}), [
						"all",
						"done",
						"pending"
					].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilterStatus(st),
						style: {
							fontSize: "11px",
							fontWeight: filterStatus === st ? 700 : 500,
							padding: "4px 10px",
							borderRadius: "6px",
							border: "1px solid",
							borderColor: filterStatus === st ? st === "done" ? "#16a34a" : st === "pending" ? "#d97706" : "#0f172a" : "#cbd5e1",
							background: filterStatus === st ? st === "done" ? "#dcfce7" : st === "pending" ? "#fef3c7" : "#0f172a" : "#ffffff",
							color: filterStatus === st ? st === "done" ? "#15803d" : st === "pending" ? "#b45309" : "#ffffff" : "#475569",
							cursor: "pointer",
							textTransform: "capitalize"
						},
						children: st
					}, st))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
					gap: "14px"
				},
				children: filteredItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "16px",
						borderRadius: "10px",
						border: item.isDone ? "1px solid #86efac" : "1px solid #cbd5e1",
						background: item.isDone ? "#fbfdfb" : "#ffffff",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						gap: "12px",
						boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: "8px",
								marginBottom: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									fontWeight: 700,
									padding: "2px 7px",
									borderRadius: "4px",
									background: "#f1f5f9",
									color: "#475569",
									textTransform: "uppercase",
									letterSpacing: "0.4px"
								},
								children: item.category
							}), item.isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "4px",
									fontSize: "11px",
									fontWeight: 700,
									padding: "3px 8px",
									borderRadius: "12px",
									background: "#dcfce7",
									color: "#15803d",
									border: "1px solid #86efac"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }), " Done"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "4px",
									fontSize: "11px",
									fontWeight: 700,
									padding: "3px 8px",
									borderRadius: "12px",
									background: "#fef3c7",
									color: "#b45309",
									border: "1px solid #fde68a"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 13 }), " Pending"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: {
								margin: "0 0 6px",
								fontSize: "13.5px",
								fontWeight: 700,
								color: "#0f172a",
								lineHeight: 1.4
							},
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: "0 0 10px",
								fontSize: "11.5px",
								color: "#64748b",
								lineHeight: 1.4
							},
							children: item.description
						}),
						item.isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "8px 10px",
								background: "#f0fdf4",
								border: "1px solid #bbf7d0",
								borderRadius: "6px",
								fontSize: "11px",
								color: "#166534",
								display: "grid",
								gap: "3px"
							},
							children: [item.type === "policy" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "5px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Consented: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.timestamp || "Recorded" })] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "5px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Signed by: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.signedBy }),
									" (",
									item.employeeId,
									")"
								] })]
							})] }), item.type !== "policy" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "5px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap"
									},
									children: ["Uploaded: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.uploadedFile })]
								})]
							}), item.uploadDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "5px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Submitted: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.uploadDate })] })]
							})] })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "8px 10px",
								background: "#fffbeb",
								border: "1px solid #fde68a",
								borderRadius: "6px",
								fontSize: "11px",
								color: "#92400e",
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
								size: 13,
								style: {
									flexShrink: 0,
									color: "#d97706"
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.type === "policy" ? "Employee has not yet submitted digital acknowledgment." : "Signed document has not been uploaded by the employee." })]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							gap: "8px",
							paddingTop: "10px",
							borderTop: "1px solid #f1f5f9"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setViewingModal({
								title: item.title,
								url: item.previewUrl,
								fileName: item.fileName,
								isDone: item.isDone,
								isEmployeeUploaded: item.isEmployeeUploaded
							}),
							className: "ui-button secondary",
							style: {
								flex: 1,
								fontSize: "11.5px",
								padding: "6px 10px",
								justifyContent: "center",
								display: "inline-flex",
								alignItems: "center",
								gap: "5px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 }),
								" ",
								item.isEmployeeUploaded ? "View Uploaded Copy" : "View Policy / Template"
							]
						})
					})]
				}, item.id))
			}),
			viewingModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
				onClick: () => setViewingModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						width: "95%",
						maxWidth: "920px",
						height: "88vh",
						display: "flex",
						flexDirection: "column",
						background: "#ffffff",
						borderRadius: "12px",
						overflow: "hidden",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
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
								alignItems: "center"
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
									children: viewingModal.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "11px",
										color: "#94a3b8"
									},
									children: [
										viewingModal.fileName || "Online Document Preview",
										" ·",
										" ",
										viewingModal.isDone ? "✓ Completed Record" : "Pending Action"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setViewingModal(null),
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
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								background: "#525659",
								position: "relative"
							},
							children: viewingModal.url && viewingModal.url.startsWith("data:image/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									width: "100%",
									height: "100%",
									overflow: "auto",
									display: "grid",
									placeItems: "center",
									padding: "20px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: viewingModal.url,
									alt: viewingModal.title,
									style: {
										maxWidth: "100%",
										maxHeight: "100%",
										objectFit: "contain"
									}
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								src: `${viewingModal.url}#toolbar=0&navpanes=0`,
								title: viewingModal.title,
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
								children: "Official HR Compliance & Audit Record"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: () => setViewingModal(null),
								style: {
									fontSize: "12px",
									padding: "6px 14px"
								},
								children: "Close Viewer"
							})]
						})
					]
				})
			})
		]
	});
}
export { EmployeeComplianceStatusCard as t };
