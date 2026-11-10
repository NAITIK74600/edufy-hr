import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { A as ShieldCheck, Et as FingerprintPattern, Qt as Camera, Xt as Check, _n as require_react, rn as Cake, vt as KeyRound } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { I as apiClient, T as hrStore, l as compressImageFile, m as ChangePasswordModal, o as PageHeader, u as PasskeyModal, x as useAuth } from "./index-5RiGRiIB.js";
import { n as formatINR } from "./currency-oCUzM0NR.js";
import { t as OnboardingDossierView } from "./OnboardingDossierView-DyijaavA.js";
import { t as EmployeeComplianceStatusCard } from "./EmployeeComplianceStatusCard-DGw5AIDn.js";
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
	const [dobModalOpen, setDobModalOpen] = (0, import_react.useState)(false);
	const [dobInput, setDobInput] = (0, import_react.useState)("");
	const [savingDob, setSavingDob] = (0, import_react.useState)(false);
	const [dobError, setDobError] = (0, import_react.useState)("");
	const [dobSuccessNotice, setDobSuccessNotice] = (0, import_react.useState)("");
	const fileInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => hrStore.subscribe(setState), []);
	const employee = state.employees.find((record) => record.id === user?.id || record.employeeId === user?.employeeId) || state.employees[0];
	if (!employee) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "alert",
		children: "Your employee record is unavailable. Contact HR."
	});
	const rawDob = employee.dob || employee.identity?.dob;
	let formattedDobInput = "";
	if (rawDob) try {
		const d = new Date(rawDob);
		if (!isNaN(d.getTime())) formattedDobInput = d.toISOString().split("T")[0];
	} catch {}
	async function handleSaveDob() {
		if (!dobInput) {
			setDobError("Please select a valid date of birth.");
			return;
		}
		setSavingDob(true);
		setDobError("");
		try {
			if (hrStore.updateMyDob) await hrStore.updateMyDob(dobInput);
			else await apiClient.patch("/employees/me/dob", { dob: dobInput });
			setDobModalOpen(false);
			setDobSuccessNotice("Date of birth updated successfully! 🎂");
			setTimeout(() => setDobSuccessNotice(""), 4500);
		} catch (err) {
			setDobError(err.response?.data?.error?.message || err.message || "Failed to save date of birth.");
		} finally {
			setSavingDob(false);
		}
	}
	async function handleClearDob() {
		if (!confirm("Are you sure you want to remove your date of birth?")) return;
		setSavingDob(true);
		setDobError("");
		try {
			if (hrStore.updateMyDob) await hrStore.updateMyDob(null);
			else await apiClient.patch("/employees/me/dob", { dob: null });
			setDobInput("");
			setDobModalOpen(false);
			setDobSuccessNotice("Date of birth removed.");
			setTimeout(() => setDobSuccessNotice(""), 4500);
		} catch (err) {
			setDobError(err.response?.data?.error?.message || err.message || "Failed to clear date of birth.");
		} finally {
			setSavingDob(false);
		}
	}
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
			dobSuccessNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 16px",
					background: "#fdf2f8",
					border: "1px solid #fbcfe8",
					borderRadius: "8px",
					color: "#db2777",
					fontSize: "13px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 16 }), dobSuccessNotice]
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
								children: "Date of Birth:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									flexWrap: "wrap",
									marginTop: "2px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.dob ? new Date(employee.dob).toLocaleDateString("en-GB", {
									day: "numeric",
									month: "short",
									year: "numeric"
								}) : employee.identity?.dob ? new Date(employee.identity.dob).toLocaleDateString("en-GB", {
									day: "numeric",
									month: "short",
									year: "numeric"
								}) : "Not provided" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setDobInput(formattedDobInput);
										setDobError("");
										setDobModalOpen(true);
									},
									title: "Fill or update your date of birth at any time (no HR verification required)",
									style: {
										padding: "2px 8px",
										fontSize: "11px",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #fbcfe8",
										background: "#fdf2f8",
										color: "#db2777",
										cursor: "pointer",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 12 }),
										" ",
										rawDob ? "Edit" : "Fill Birthday"
									]
								})]
							})
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
			}),
			dobModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "dob-modal-title",
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(15, 23, 42, 0.65)",
					backdropFilter: "blur(3px)",
					zIndex: 1100,
					display: "grid",
					placeItems: "center",
					padding: "16px"
				},
				onClick: (e) => {
					if (e.target === e.currentTarget && !savingDob) setDobModalOpen(false);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						maxWidth: "430px",
						width: "100%",
						padding: "24px",
						borderRadius: "14px",
						boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)",
						position: "relative",
						background: "var(--card-bg, #ffffff)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								id: "dob-modal-title",
								style: {
									margin: 0,
									fontSize: "17px",
									fontWeight: 700,
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, {
									size: 20,
									style: { color: "#db2777" }
								}), " My Date of Birth"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: savingDob,
								onClick: () => setDobModalOpen(false),
								style: {
									background: "none",
									border: "none",
									cursor: "pointer",
									fontSize: "20px",
									color: "var(--muted, #64748b)",
									lineHeight: 1,
									padding: "4px"
								},
								children: "✕"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								fontSize: "12.5px",
								color: "var(--text-secondary)",
								margin: "0 0 16px",
								lineHeight: 1.5
							},
							children: [
								"Fill or update your birth date at any time. It automatically reflects on team celebrations, calendar widgets, and your official profile — ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "no HR verification or approval needed" }),
								"."
							]
						}),
						dobError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "9px 12px",
								background: "#fee2e2",
								color: "#b91c1c",
								border: "1px solid #fca5a5",
								borderRadius: "7px",
								fontSize: "12px",
								marginBottom: "14px",
								fontWeight: 500
							},
							children: dobError
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gap: "6px",
								marginBottom: "22px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "12px",
									fontWeight: 600,
									color: "var(--text-secondary)"
								},
								children: "Date of Birth"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								max: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
								value: dobInput,
								onChange: (e) => setDobInput(e.target.value),
								style: {
									padding: "10px 12px",
									borderRadius: "8px",
									border: "1px solid var(--border-color, #cbd5e1)",
									fontSize: "14px",
									outline: "none",
									width: "100%",
									boxSizing: "border-box"
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "10px",
								flexWrap: "wrap"
							},
							children: [rawDob ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: savingDob,
								onClick: handleClearDob,
								style: {
									padding: "8px 12px",
									fontSize: "12px",
									fontWeight: 600,
									borderRadius: "6px",
									border: "1px solid #fecaca",
									background: "#fff",
									color: "#dc2626",
									cursor: "pointer"
								},
								children: "Clear Birthday"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: savingDob,
									onClick: () => setDobModalOpen(false),
									className: "ui-button secondary",
									style: { fontSize: "12px" },
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: savingDob || !dobInput,
									onClick: handleSaveDob,
									className: "ui-button primary",
									style: {
										fontSize: "12px",
										display: "flex",
										alignItems: "center",
										gap: "6px",
										background: "#db2777",
										borderColor: "#db2777"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 13 }),
										" ",
										savingDob ? "Saving..." : "Save Birthday"
									]
								})]
							})]
						})
					]
				})
			})
		]
	});
}
export { EmployeeProfilePage };
