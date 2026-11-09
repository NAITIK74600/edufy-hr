import { hn as ArrowLeft } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { o as PageHeader, s as StatePanel, t as Button } from "./index-CAEauPo_.js";
// src/pages/ModulePlaceholder.jsx
var import_jsx_runtime = require_jsx_runtime();
function NotFoundPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "404",
		title: "Page not found",
		description: "This route is not part of the HR workspace.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			as: "a",
			href: "#/hr",
			variant: "secondary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 15 }), " Back to overview"]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatePanel, {
		title: "Unknown route",
		message: "Use the HR navigation to open a supported workspace.",
		tone: "error"
	})] });
}
export { NotFoundPage };
