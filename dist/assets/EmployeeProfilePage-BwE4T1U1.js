import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { A as ShieldCheck, Et as FingerprintPattern, Qt as Camera, Xt as Check, _n as require_react, vt as KeyRound } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { I as apiClient, T as hrStore, l as compressImageFile, m as ChangePasswordModal, o as PageHeader, u as PasskeyModal, x as useAuth } from "./index-DPfPlI3e.js";
import { n as formatINR } from "./currency-oCUzM0NR.js";
import { t as OnboardingDossierView } from "./OnboardingDossierView-Cbmslv9U.js";
import { t as EmployeeComplianceStatusCard } from "./EmployeeComplianceStatusCard-D12PscHm.js";
// src/pages/EmployeeProfilePage.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function EmployeeProfilePage() {
	const { user, updateUser } = useAuth();
	const [state, setState] = (0, import_react.useState)(() => hrStore.getState());
	const [photoNotice, setPhotoNotice] = (0, import_react.useState)(false);
	const [uploadingPhoto, setUploadingPhoto] = (0, import_react.useState)(false);
	const [passwordModalOpen, setPasswordModalOpen] = (0, import_react.useState)(false);
	const [passkeyModalOpen, setPasskeyModalOpen] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => hrStore.subscribe(setState), []);
	const employee = state.employees.find((record) => record.id === user?.id || record.employeeId === user?.employeeId) || state.employees[0];
	if (!employee) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "alert",
		children: "Your employee record is unavailable. Contact HR."
	});
	const avatarUrl = user?.avatarUrl || employee?.avatarUrl || employee?.onboardingDocs?.passportPhoto?.url;
	async function handlePhotoUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingPhoto(true);
		try {
			const dataUrl = await compressImageFile(file, 384, 384, .75);
			if (dataUrl) {
				if (hrStore.updateMyAvatar) await hrStore.updateMyAvatar(dataUrl);
				else await apiClient.patch("/employees/me/avatar", { avatarUrl: dataUrl });
				if (updateUser) updateUser({ avatarUrl: dataUrl });
				setPhotoNotice(true);
				setTimeout(() => setPhotoNotice(false), 4e3);
			}
		} catch (err) {
			console.error("Failed to persist profile picture:", err.message);
			alert("Failed to save profile picture: " + (err.message || "Please try again."));
		} finally {
			setUploadingPhoto(false);
			if (e.target) e.target.value = "";
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Employee Self-Service",
				title: "My Profile & Onboarding Documents",
				description: "View and manage your official employment record, identity credentials, statutory numbers, and onboarding verification documents."
			}),
			photoNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 16px",
					background: "#dcfce7",
					border: "1px solid #86efac",
					borderRadius: "8px",
					color: "#15803d",
					fontSize: "13px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 16 }), "Profile picture updated and saved successfully!"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { padding: "22px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "20px",
						alignItems: "center",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								width: "78px",
								height: "78px"
							},
							children: [
								avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: avatarUrl,
									alt: employee.name,
									style: {
										width: "78px",
										height: "78px",
										borderRadius: "50%",
										objectFit: "cover",
										border: "3px solid var(--teal)"
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										width: "78px",
										height: "78px",
										borderRadius: "50%",
										background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
										color: "#ffffff",
										display: "grid",
										placeItems: "center",
										fontSize: "24px",
										fontWeight: 700
									},
									children: employee.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => fileInputRef.current?.click(),
									title: "Change profile picture",
									disabled: uploadingPhoto,
									style: {
										position: "absolute",
										bottom: "-2px",
										right: "-2px",
										width: "26px",
										height: "26px",
										borderRadius: "50%",
										background: "var(--teal)",
										display: "grid",
										placeItems: "center",
										color: "#fff",
										cursor: "pointer",
										boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
										border: "2px solid #fff"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { size: 13 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileInputRef,
									type: "file",
									accept: "image/*",
									style: { display: "none" },
									onChange: handlePhotoUpload
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								flex: 1,
								minWidth: "220px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px",
									flexWrap: "wrap"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									style: {
										margin: 0,
										fontSize: "20px",
										fontWeight: 700
									},
									children: employee.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										padding: "3px 8px",
										borderRadius: "12px",
										background: employee.status === "active" ? "#dcfce7" : "#fef3c7",
										color: employee.status === "active" ? "#15803d" : "#b45309"
									},
									children: employee.status?.toUpperCase()
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									margin: "4px 0 0",
									color: "var(--text-secondary)",
									fontSize: "13px"
								},
								children: [
									employee.designation || "Pending Designation",
									" · ",
									employee.department || "Operations",
									" · ID: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "var(--teal)" },
										children: employee.employeeId
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gap: "4px",
								textAlign: "right",
								fontSize: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--text-secondary)" },
									children: "Annual Salary Profile"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "16px",
										color: "var(--teal)"
									},
									children: formatINR(employee.salary ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
									style: {
										color: "var(--muted)",
										fontSize: "10px"
									},
									children: "Final net pay reflected on monthly payslip"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: "14px",
						marginTop: "20px",
						paddingTop: "16px",
						borderTop: "1px solid var(--border-color)",
						fontSize: "12px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--text-secondary)" },
								children: "Official Email:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.email })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--text-secondary)" },
								children: "Phone Number:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.phone || "Not configured" })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--text-secondary)" },
								children: "Joining Date:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.joiningDate })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--text-secondary)" },
								children: "Reporting Manager:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.managerName || "Company Executive" })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--text-secondary)" },
								children: "Employment Type:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { textTransform: "capitalize" },
								children: employee.employmentType?.replace("_", " ") || "Full time"
							})
						] })
					]
				})]
			}),
			[
				"admin",
				"hr",
				"superadmin"
			].includes(String(user?.role || "").toLowerCase()) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeComplianceStatusCard, { employee }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "panel",
				style: { padding: "22px" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						style: {
							margin: "0 0 4px",
							fontSize: "16px",
							fontWeight: 700,
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
							size: 18,
							style: { color: "var(--teal)" }
						}), " Account Security & Password"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "12px",
							color: "var(--text-secondary)"
						},
						children: "Manage your personal corporate portal access password and security credentials."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => setPasskeyModalOpen(true),
							style: {
								display: "flex",
								alignItems: "center",
								gap: "6px",
								fontSize: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, {
								size: 14,
								style: { color: "var(--teal)" }
							}), " Passkeys & Biometrics"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button primary",
							onClick: () => setPasswordModalOpen(true),
							style: {
								display: "flex",
								alignItems: "center",
								gap: "6px",
								fontSize: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { size: 14 }), " Change Password"]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { padding: "22px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					style: {
						margin: "0 0 16px",
						fontSize: "16px",
						fontWeight: 700,
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
						size: 18,
						style: { color: "var(--teal)" }
					}), " Official Onboarding Documents & Verification"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingDossierView, {
					employee,
					canEdit: true,
					canVerify: false
				})]
			}),
			passwordModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePasswordModal, {
				isOpen: true,
				isForced: false,
				onClose: () => setPasswordModalOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasskeyModal, {
				isOpen: passkeyModalOpen,
				onClose: () => setPasskeyModalOpen(false)
			})
		]
	});
}
export { EmployeeProfilePage };
