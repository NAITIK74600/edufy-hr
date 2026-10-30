import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{C as t,Ct as n,E as r,Ft as i,V as a,_t as o,an as s,et as c,nn as l,nt as u,ut as d,wt as f}from"./icons-vendor-DMORvt_z.js";import{n as p}from"./react-vendor-Bkj58Zg0.js";import{d as m,f as h,l as g,u as _,y as v}from"./index-vAwstcuU.js";var y=e(s(),1),b=p(),x=`E:/hr dashbord/src/pages/LoginPage.jsx`;function S(){return(0,b.jsxDEV)(`style`,{children:`
      .edufyi-login-root,
      .edufyi-login-root * {
        box-sizing: border-box !important;
      }

      .edufyi-login-root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        background-color: #040812 !important;
        background-image: 
          radial-gradient(circle at 80% 12%, rgba(0, 180, 216, 0.20) 0%, transparent 45%),
          radial-gradient(circle at 18% 85%, rgba(2, 132, 199, 0.15) 0%, transparent 42%) !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        width: 100% !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 40px 16px !important;
        position: relative !important;
        overflow-x: hidden !important;
      }

      /* Premium Card Layout */
      .edufyi-login-card {
        width: 100% !important;
        max-width: 430px !important;
        background: rgba(11, 22, 38, 0.88) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(0, 180, 216, 0.25) !important;
        box-shadow: 
          0 24px 60px rgba(0, 0, 0, 0.65),
          0 0 35px rgba(0, 180, 216, 0.12) !important;
        border-radius: 22px !important;
        padding: 36px 30px 32px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        z-index: 2 !important;
        position: relative !important;
      }

      @media (max-width: 480px) {
        .edufyi-login-card {
          padding: 28px 18px 24px !important;
          border-radius: 18px !important;
        }
      }

      /* Official Logo Image */
      .edufyi-brand-logo {
        height: 48px !important;
        max-width: 240px !important;
        object-fit: contain !important;
        margin-bottom: 20px !important;
        filter: drop-shadow(0 0 16px rgba(0, 180, 216, 0.40)) !important;
        display: block !important;
      }

      /* Pill Badge */
      .edufyi-pill-badge {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.08em !important;
        padding: 5px 16px !important;
        border-radius: 9999px !important;
        background: rgba(0, 180, 216, 0.08) !important;
        border: 1px solid rgba(0, 180, 216, 0.45) !important;
        color: #00d2ff !important;
        margin-bottom: 14px !important;
      }

      /* Heading & Subtitle */
      .edufyi-login-title {
        font-size: 28px !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 0 8px 0 !important;
        letter-spacing: -0.025em !important;
        line-height: 1.2 !important;
      }

      .edufyi-login-subtitle {
        font-size: 13.5px !important;
        color: #7d8fa9 !important;
        margin: 0 0 22px 0 !important;
        line-height: 1.45 !important;
        max-width: 340px !important;
      }

      /* Management Role Tabs */
      .edufyi-mgmt-tabs {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin-bottom: 18px !important;
      }

      .edufyi-mgmt-tab {
        height: 44px !important;
        background: #081322 !important;
        border: 1px solid rgba(30, 58, 95, 0.8) !important;
        border-radius: 10px !important;
        color: #64748b !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-mgmt-tab:hover {
        color: #cbd5e1 !important;
        border-color: rgba(0, 180, 216, 0.4) !important;
      }

      .edufyi-mgmt-tab.active {
        background: #06172a !important;
        border: 2px solid #00b4d8 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 0 16px rgba(0, 180, 216, 0.28) !important;
      }

      /* Form */
      .edufyi-login-form {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;
      }

      /* Input Box Container */
      .edufyi-login-root .edufyi-field-box {
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        height: 50px !important;
        background: #07101b !important;
        background-color: #07101b !important;
        border: 1px solid rgba(30, 58, 95, 0.85) !important;
        border-radius: 12px !important;
        box-shadow: none !important;
        transition: all 0.2s ease !important;
        overflow: hidden !important;
      }

      .edufyi-login-root .edufyi-field-box:focus-within {
        border-color: #00b4d8 !important;
        box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.2) !important;
        background: #091626 !important;
        background-color: #091626 !important;
      }

      /* Input Icon */
      .edufyi-login-root .edufyi-field-icon {
        position: absolute !important;
        left: 17px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        color: #5a7194 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: none !important;
        z-index: 5 !important;
      }

      .edufyi-login-root .edufyi-field-box:focus-within .edufyi-field-icon {
        color: #00b4d8 !important;
      }

      /* Actual HTML Input Field (High specificity override) */
      .edufyi-login-root input.edufyi-field-input,
      .edufyi-login-root .edufyi-field-box input,
      .edufyi-login-root .edufyi-field-box input[type="text"],
      .edufyi-login-root .edufyi-field-box input[type="email"],
      .edufyi-login-root .edufyi-field-box input[type="password"] {
        display: block !important;
        width: 100% !important;
        height: 50px !important;
        min-height: 50px !important;
        max-height: 50px !important;
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        border-width: 0 !important;
        outline: none !important;
        box-shadow: none !important;
        color: #ffffff !important;
        font-size: 14.5px !important;
        font-weight: 500 !important;
        padding: 0 44px 0 50px !important;
        margin: 0 !important;
        line-height: 50px !important;
        font-family: inherit !important;
      }

      .edufyi-login-root input.edufyi-field-input:focus,
      .edufyi-login-root .edufyi-field-box input:focus,
      .edufyi-login-root .edufyi-field-box input[type="text"]:focus,
      .edufyi-login-root .edufyi-field-box input[type="email"]:focus,
      .edufyi-login-root .edufyi-field-box input[type="password"]:focus {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        color: #ffffff !important;
      }

      .edufyi-login-root input.edufyi-field-input::placeholder,
      .edufyi-login-root .edufyi-field-box input::placeholder {
        color: #556d8f !important;
        font-size: 14px !important;
        opacity: 1 !important;
      }

      /* Chrome autofill dark background preservation */
      .edufyi-login-root input:-webkit-autofill,
      .edufyi-login-root input:-webkit-autofill:hover,
      .edufyi-login-root input:-webkit-autofill:focus,
      .edufyi-login-root input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #07101b inset !important;
        -webkit-text-fill-color: #ffffff !important;
        caret-color: #ffffff !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }

      /* Password Eye Toggle */
      .edufyi-login-root .edufyi-eye-toggle {
        position: absolute !important;
        right: 14px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        background: transparent !important;
        border: none !important;
        color: #5a7194 !important;
        cursor: pointer !important;
        padding: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 5 !important;
      }

      .edufyi-login-root .edufyi-eye-toggle:hover {
        color: #00b4d8 !important;
      }

      /* Row with Remember me + recovery link */
      .edufyi-login-root .edufyi-action-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
        margin-top: 4px !important;
        margin-bottom: 8px !important;
        font-size: 13.5px !important;
      }

      .edufyi-login-root .edufyi-remember-label {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        color: #cbd5e1 !important;
        cursor: pointer !important;
        user-select: none !important;
        font-size: 13.5px !important;
      }

      .edufyi-login-root .edufyi-checkbox {
        appearance: none !important;
        -webkit-appearance: none !important;
        width: 18px !important;
        height: 18px !important;
        border: 1.5px solid #00b4d8 !important;
        border-radius: 4px !important;
        background: #07101b !important;
        cursor: pointer !important;
        display: inline-grid !important;
        place-content: center !important;
        position: relative !important;
        margin: 0 !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-login-root .edufyi-checkbox:checked {
        background: #00b4d8 !important;
        box-shadow: 0 0 10px rgba(0, 180, 216, 0.6) !important;
      }

      .edufyi-login-root .edufyi-checkbox:checked::before {
        content: "" !important;
        width: 10px !important;
        height: 5px !important;
        border-left: 2px solid #ffffff !important;
        border-bottom: 2px solid #ffffff !important;
        transform: rotate(-45deg) translate(1px, -1px) !important;
      }

      .edufyi-login-root .edufyi-link {
        color: #00b4d8 !important;
        font-weight: 600 !important;
        text-decoration: none !important;
        cursor: pointer !important;
        background: none !important;
        border: none !important;
        padding: 0 !important;
        font-size: 13.5px !important;
      }

      .edufyi-login-root .edufyi-link:hover {
        text-decoration: underline !important;
        color: #38bdf8 !important;
      }

      /* Primary Vibrant Cyan Button with Glowing Under Drop Shadow */
      .edufyi-login-root .edufyi-primary-btn {
        width: 100% !important;
        height: 50px !important;
        background: #00a8e8 !important;
        border: none !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        font-size: 14px !important;
        font-weight: 800 !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        box-shadow: 0 8px 24px rgba(0, 168, 232, 0.45) !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-login-root .edufyi-primary-btn:hover:not(:disabled) {
        background: #00b4d8 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 12px 30px rgba(0, 180, 216, 0.6) !important;
      }

      .edufyi-login-root .edufyi-primary-btn:active:not(:disabled) {
        transform: translateY(0) !important;
      }

      .edufyi-login-root .edufyi-primary-btn:disabled {
        opacity: 0.65 !important;
        cursor: not-allowed !important;
      }

      /* Secondary Outline Button */
      .edufyi-login-root .edufyi-secondary-btn {
        width: 100% !important;
        height: 48px !important;
        background: #07101b !important;
        border: 1px solid rgba(30, 58, 95, 0.85) !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-login-root .edufyi-secondary-btn:hover {
        background: #0c1c2e !important;
        border-color: rgba(0, 180, 216, 0.4) !important;
        color: #ffffff !important;
      }

      /* Error Alert */
      .edufyi-login-root .edufyi-error-box {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        background: rgba(239, 68, 68, 0.12) !important;
        border: 1px solid rgba(239, 68, 68, 0.35) !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
        margin-bottom: 14px !important;
        color: #fca5a5 !important;
        font-size: 12.5px !important;
        line-height: 1.4 !important;
        width: 100% !important;
        text-align: left !important;
      }

      /* Notice Box */
      .edufyi-login-root .edufyi-notice-box {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        background: rgba(0, 180, 216, 0.12) !important;
        border: 1px solid rgba(0, 180, 216, 0.35) !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
        margin-bottom: 14px !important;
        color: #7dd3fc !important;
        font-size: 12.5px !important;
        line-height: 1.4 !important;
        width: 100% !important;
        text-align: left !important;
      }
    `},void 0,!1,{fileName:x,lineNumber:28,columnNumber:5},this)}function C(){let{login:e,changePassword:r,completeSession:s}=v(),[p,C]=(0,y.useState)(``),[w,T]=(0,y.useState)(``),[E,D]=(0,y.useState)(!1),[O,k]=(0,y.useState)(!0),[A,j]=(0,y.useState)(!1),[M,N]=(0,y.useState)(!1),[P,F]=(0,y.useState)(!1),[I,L]=(0,y.useState)(``),[R,z]=(0,y.useState)(``),[B,V]=(0,y.useState)(!1),[H,U]=(0,y.useState)(``),[W,G]=(0,y.useState)(``),[K,q]=(0,y.useState)(!1);async function J(){if(L(``),z(``),!_())L(`Biometric Passkeys (Touch ID, Windows Hello, Face ID) are not supported on this browser.`);else{N(!0);try{let e=await m({email:p.trim(),portal:`employee`});e.token&&e.user&&(s(e.token,e.user),window.location.hash=`#/employee`)}catch(e){if(e.name===`NotAllowedError`)L(`Passkey prompt was cancelled.`);else if(e.code===`NO_PASSKEY_REGISTERED`||e.message?.includes(`No registered passkey`)){if(w&&p.trim())try{z(`Registering this device as your trusted passkey...`);let e=await h({email:p.trim(),password:w,deviceName:navigator.userAgent.includes(`Windows`)?`Windows Hello`:`Biometric Key`});if(e.token&&e.user){s(e.token,e.user),window.location.hash=`#/employee`;return}}catch(e){L(e.message||`Passkey registration cancelled.`)}else L(`No passkey registered for this account yet. Please enter your password once to register your device.`)}else L(e.message||`Passkey verification failed.`)}finally{N(!1),z(``)}}}async function Y(t){if(t&&t.preventDefault(),L(``),z(``),!p.trim()||!w)L(`Please enter your work email, username, or employee ID and password.`);else{j(!0);try{let t=await e(p.trim(),w,`employee`);if(t?.role===`admin`||t?.role===`hr`)throw Error(`Access denied: Management accounts must log in via the HR / Admin Console.`);if(t?.mustChangePassword){V(!0),z(`First-time login detected: An auto-generated temporary password was used. Please set a new password below.`);return}window.location.hash=`#/employee`}catch(e){L(e.message||`Invalid email or password.`)}finally{j(!1)}}}async function X(e){if(e&&e.preventDefault(),L(``),!H||H.trim().length<8)L(`New password must be at least 8 characters long.`);else if(H!==W)L(`New password and confirmation do not match.`);else if(H===w)L(`New password must be different from your temporary password.`);else{j(!0);try{await r({currentPassword:w,newPassword:H.trim()}),window.location.hash=`#/employee`}catch(e){L(e?.message||`Failed to set new password. Please try again.`)}finally{j(!1)}}}return(0,b.jsxDEV)(`div`,{className:`edufyi-login-root`,children:[(0,b.jsxDEV)(S,{},void 0,!1,{fileName:x,lineNumber:573,columnNumber:7},this),(0,b.jsxDEV)(`div`,{className:`edufyi-login-card`,children:[(0,b.jsxDEV)(`img`,{src:`/elythra-edufyitech-logo.png`,alt:`Elythra EdufyiTech`,className:`edufyi-brand-logo`},void 0,!1,{fileName:x,lineNumber:576,columnNumber:9},this),(0,b.jsxDEV)(`div`,{className:`edufyi-pill-badge`,children:[(0,b.jsxDEV)(t,{size:13,style:{color:`#00d2ff`}},void 0,!1,{fileName:x,lineNumber:584,columnNumber:11},this),(0,b.jsxDEV)(`span`,{children:B?`SECURITY SETUP`:`EMPLOYEE SELF-SERVICE`},void 0,!1,{fileName:x,lineNumber:585,columnNumber:11},this)]},void 0,!0,{fileName:x,lineNumber:583,columnNumber:9},this),(0,b.jsxDEV)(`h1`,{className:`edufyi-login-title`,children:B?`Set New Password`:`Employee Login`},void 0,!1,{fileName:x,lineNumber:589,columnNumber:9},this),(0,b.jsxDEV)(`p`,{className:`edufyi-login-subtitle`,children:B?`Choose a permanent personal password to secure your account`:`Sign in with your Admin or HR-created account`},void 0,!1,{fileName:x,lineNumber:592,columnNumber:9},this),I&&(0,b.jsxDEV)(`div`,{className:`edufyi-error-box`,children:[(0,b.jsxDEV)(i,{size:15,style:{flexShrink:0}},void 0,!1,{fileName:x,lineNumber:601,columnNumber:13},this),(0,b.jsxDEV)(`span`,{children:I},void 0,!1,{fileName:x,lineNumber:602,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:600,columnNumber:11},this),R&&(0,b.jsxDEV)(`div`,{className:`edufyi-notice-box`,children:[(0,b.jsxDEV)(t,{size:15,style:{flexShrink:0}},void 0,!1,{fileName:x,lineNumber:609,columnNumber:13},this),(0,b.jsxDEV)(`span`,{children:R},void 0,!1,{fileName:x,lineNumber:610,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:608,columnNumber:11},this),B?(0,b.jsxDEV)(`form`,{onSubmit:X,className:`edufyi-login-form`,children:[(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(d,{size:17},void 0,!1,{fileName:x,lineNumber:618,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:617,columnNumber:15},this),(0,b.jsxDEV)(`input`,{type:K?`text`:`password`,className:`edufyi-field-input`,placeholder:`New Password (min 8 characters)`,value:H,onChange:e=>U(e.target.value),autoComplete:`new-password`,disabled:A,autoFocus:!0},void 0,!1,{fileName:x,lineNumber:620,columnNumber:15},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>q(!K),tabIndex:-1,children:K?(0,b.jsxDEV)(f,{size:16},void 0,!1,{fileName:x,lineNumber:636,columnNumber:36},this):(0,b.jsxDEV)(n,{size:16},void 0,!1,{fileName:x,lineNumber:636,columnNumber:59},this)},void 0,!1,{fileName:x,lineNumber:630,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:616,columnNumber:13},this),(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(u,{size:17},void 0,!1,{fileName:x,lineNumber:642,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:641,columnNumber:15},this),(0,b.jsxDEV)(`input`,{type:K?`text`:`password`,className:`edufyi-field-input`,placeholder:`Confirm New Password`,value:W,onChange:e=>G(e.target.value),autoComplete:`new-password`,disabled:A},void 0,!1,{fileName:x,lineNumber:644,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:640,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:A,children:A?`SAVING NEW PASSWORD...`:(0,b.jsxDEV)(b.Fragment,{children:[`SAVE PASSWORD & ENTER `,(0,b.jsxDEV)(l,{size:16},void 0,!1,{fileName:x,lineNumber:658,columnNumber:41},this)]},void 0,!0,{fileName:x,lineNumber:657,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:655,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:615,columnNumber:11},this):(0,b.jsxDEV)(`form`,{onSubmit:Y,className:`edufyi-login-form`,children:[(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(c,{size:17},void 0,!1,{fileName:x,lineNumber:667,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:666,columnNumber:15},this),(0,b.jsxDEV)(`input`,{type:`text`,className:`edufyi-field-input`,placeholder:`Work Email, Username or Employee ID`,value:p,onChange:e=>C(e.target.value),autoComplete:`username`,disabled:A},void 0,!1,{fileName:x,lineNumber:669,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:665,columnNumber:13},this),(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(u,{size:17},void 0,!1,{fileName:x,lineNumber:682,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:681,columnNumber:15},this),(0,b.jsxDEV)(`input`,{type:E?`text`:`password`,className:`edufyi-field-input`,placeholder:`Password`,value:w,onChange:e=>T(e.target.value),autoComplete:`current-password`,disabled:A},void 0,!1,{fileName:x,lineNumber:684,columnNumber:15},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>D(!E),tabIndex:-1,"aria-label":E?`Hide password`:`Show password`,children:E?(0,b.jsxDEV)(f,{size:16},void 0,!1,{fileName:x,lineNumber:700,columnNumber:33},this):(0,b.jsxDEV)(n,{size:16},void 0,!1,{fileName:x,lineNumber:700,columnNumber:56},this)},void 0,!1,{fileName:x,lineNumber:693,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:680,columnNumber:13},this),(0,b.jsxDEV)(`div`,{className:`edufyi-action-row`,children:[(0,b.jsxDEV)(`label`,{className:`edufyi-remember-label`,children:[(0,b.jsxDEV)(`input`,{type:`checkbox`,className:`edufyi-checkbox`,checked:O,onChange:e=>k(e.target.checked)},void 0,!1,{fileName:x,lineNumber:706,columnNumber:17},this),`Remember me`]},void 0,!0,{fileName:x,lineNumber:705,columnNumber:15},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-link`,onClick:()=>z(`For account recovery, password resets, or credentials lookup, please reach out to your HR Operations team.`),children:`Forgot password?`},void 0,!1,{fileName:x,lineNumber:714,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:704,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:A,children:A?`SIGNING IN...`:(0,b.jsxDEV)(b.Fragment,{children:[`SIGN IN `,(0,b.jsxDEV)(l,{size:16},void 0,!1,{fileName:x,lineNumber:726,columnNumber:27},this)]},void 0,!0,{fileName:x,lineNumber:725,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:723,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-secondary-btn`,onClick:J,disabled:A||M,children:[(0,b.jsxDEV)(o,{size:17,style:{color:`#00d2ff`}},void 0,!1,{fileName:x,lineNumber:737,columnNumber:15},this),M?`VERIFYING PASSKEY...`:`Sign in with Passkey / Biometrics`]},void 0,!0,{fileName:x,lineNumber:731,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`button`,onClick:()=>F(!0),style:{background:`transparent`,border:0,color:`#00d2ff`,fontSize:`12px`,fontWeight:600,cursor:`pointer`,padding:`4px 0 0`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`5px`,margin:`0 auto`},children:[(0,b.jsxDEV)(a,{size:13},void 0,!1,{fileName:x,lineNumber:759,columnNumber:15},this),(0,b.jsxDEV)(`span`,{children:`First time on this device? Add / Register Passkey`},void 0,!1,{fileName:x,lineNumber:760,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:741,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:664,columnNumber:11},this),(0,b.jsxDEV)(g,{isOpen:P,onClose:()=>F(!1),initialEmail:p,initialPassword:w},void 0,!1,{fileName:x,lineNumber:764,columnNumber:9},this)]},void 0,!0,{fileName:x,lineNumber:574,columnNumber:7},this)]},void 0,!0,{fileName:x,lineNumber:572,columnNumber:5},this)}function w({defaultRole:e=`hr`}){let{login:t,changePassword:s,completeSession:p}=v(),[C,w]=(0,y.useState)(()=>typeof window<`u`&&window.location.hash.includes(`admin`)?`admin`:e),[T,E]=(0,y.useState)(()=>C===`admin`?`admin@edufyitech.in`:`hr@edufyi.in`),[D,O]=(0,y.useState)(``),[k,A]=(0,y.useState)(!1),[j,M]=(0,y.useState)(!0),[N,P]=(0,y.useState)(!1),[F,I]=(0,y.useState)(!1),[L,R]=(0,y.useState)(!1),[z,B]=(0,y.useState)(``),[V,H]=(0,y.useState)(``),[U,W]=(0,y.useState)(!1),[G,K]=(0,y.useState)(``),[q,J]=(0,y.useState)(``),[Y,X]=(0,y.useState)(!1);async function Z(){if(B(``),H(``),!_())B(`Biometric Passkeys (Touch ID, Windows Hello, Face ID) are not supported on this browser.`);else{I(!0);try{let e=await m({email:T.trim(),portal:C});e.token&&e.user&&(p(e.token,e.user),window.location.hash=C===`admin`?`#/admin`:`#/hr`)}catch(e){if(e.name===`NotAllowedError`)B(`Passkey prompt was cancelled.`);else if(e.code===`NO_PASSKEY_REGISTERED`||e.message?.includes(`No registered passkey`)){if(D&&T.trim())try{H(`Registering this device as your trusted passkey...`);let e=await h({email:T.trim(),password:D,deviceName:navigator.userAgent.includes(`Windows`)?`Windows Hello`:`Biometric Key`});if(e.token&&e.user){p(e.token,e.user),window.location.hash=C===`admin`?`#/admin`:`#/hr`;return}}catch(e){B(e.message||`Passkey registration cancelled.`)}else B(`No passkey registered for this account yet. Please enter your password once to register your device.`)}else B(e.message||`Passkey verification failed.`)}finally{I(!1),H(``)}}}(0,y.useEffect)(()=>{let e=()=>{let e=window.location.hash||``;e.includes(`admin`)?(w(`admin`),E(e=>!e||e===`hr@edufyi.in`||e===`hr@edufyitech.in`?`admin@edufyitech.in`:e)):e.includes(`hr`)&&(w(`hr`),E(e=>!e||e===`admin@edufyitech.in`||e===`admin@edufyi.in`?`hr@edufyi.in`:e))};return e(),window.addEventListener(`hashchange`,e),()=>window.removeEventListener(`hashchange`,e)},[]);function Q(e){w(e),B(``),H(``),e===`admin`?(T&&T!==`hr@edufyi.in`&&T!==`hr@edufyitech.in`||E(`admin@edufyitech.in`),window.location.hash=`#/admin/login`):(T&&T!==`admin@edufyitech.in`&&T!==`admin@edufyi.in`||E(`hr@edufyi.in`),window.location.hash=`#/hr/login`)}async function ee(e){if(e&&e.preventDefault(),B(``),H(``),!T.trim()||!D)B(C===`admin`?`Please enter your administrator email and password.`:`Please enter your HR operational email and password.`);else{P(!0);try{let e=C===`admin`?`admin`:`hr`,n=await t(T.trim(),D,e);if(n?.mustChangePassword){W(!0),H(`First-time login detected: An auto-generated temporary password was used. Please set a new password below.`);return}if(n?.role===`admin`)window.location.hash=`#/admin`;else if(n?.role===`hr`)window.location.hash=`#/hr`;else throw Error(`Access denied: Employee accounts cannot sign into the HR or Admin Management Console.`)}catch(e){B(e.message||`Invalid email or password.`)}finally{P(!1)}}}async function te(e){if(e&&e.preventDefault(),B(``),!G||G.trim().length<8)B(`New password must be at least 8 characters long.`);else if(G!==q)B(`New password and confirmation do not match.`);else if(G===D)B(`New password must be different from your temporary password.`);else{P(!0);try{await s({currentPassword:D,newPassword:G.trim()}),window.location.hash=C===`admin`?`#/admin`:`#/hr`}catch(e){B(e?.message||`Failed to set new password. Please try again.`)}finally{P(!1)}}}let $=C===`hr`;return(0,b.jsxDEV)(`div`,{className:`edufyi-login-root`,children:[(0,b.jsxDEV)(S,{},void 0,!1,{fileName:x,lineNumber:949,columnNumber:7},this),(0,b.jsxDEV)(`div`,{className:`edufyi-login-card`,children:[(0,b.jsxDEV)(`img`,{src:`/elythra-edufyitech-logo.png`,alt:`Elythra EdufyiTech`,className:`edufyi-brand-logo`},void 0,!1,{fileName:x,lineNumber:952,columnNumber:9},this),(0,b.jsxDEV)(`div`,{className:`edufyi-pill-badge`,children:[(0,b.jsxDEV)(r,{size:13,style:{color:`#00d2ff`}},void 0,!1,{fileName:x,lineNumber:960,columnNumber:11},this),(0,b.jsxDEV)(`span`,{children:$?`HR OPERATIONS`:`ADMIN CONSOLE`},void 0,!1,{fileName:x,lineNumber:961,columnNumber:11},this)]},void 0,!0,{fileName:x,lineNumber:959,columnNumber:9},this),(0,b.jsxDEV)(`h1`,{className:`edufyi-login-title`,children:$?`HR Operations Sign In`:`Admin Terminal Sign In`},void 0,!1,{fileName:x,lineNumber:965,columnNumber:9},this),(0,b.jsxDEV)(`p`,{className:`edufyi-login-subtitle`,children:$?`People Operations & Workforce Management (Employee accounts not permitted)`:`Executive System Administration & Global Configuration (Employee accounts not permitted)`},void 0,!1,{fileName:x,lineNumber:968,columnNumber:9},this),(0,b.jsxDEV)(`div`,{className:`edufyi-mgmt-tabs`,children:[(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-mgmt-tab ${$?``:`active`}`,onClick:()=>Q(`admin`),children:`Admin Terminal`},void 0,!1,{fileName:x,lineNumber:976,columnNumber:11},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-mgmt-tab ${$?`active`:``}`,onClick:()=>Q(`hr`),children:`HR Operations`},void 0,!1,{fileName:x,lineNumber:983,columnNumber:11},this)]},void 0,!0,{fileName:x,lineNumber:975,columnNumber:9},this),z&&(0,b.jsxDEV)(`div`,{className:`edufyi-error-box`,children:[(0,b.jsxDEV)(i,{size:15,style:{flexShrink:0}},void 0,!1,{fileName:x,lineNumber:995,columnNumber:13},this),(0,b.jsxDEV)(`span`,{children:z},void 0,!1,{fileName:x,lineNumber:996,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:994,columnNumber:11},this),V&&(0,b.jsxDEV)(`div`,{className:`edufyi-notice-box`,children:[(0,b.jsxDEV)(r,{size:15,style:{flexShrink:0}},void 0,!1,{fileName:x,lineNumber:1003,columnNumber:13},this),(0,b.jsxDEV)(`span`,{children:V},void 0,!1,{fileName:x,lineNumber:1004,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:1002,columnNumber:11},this),U?(0,b.jsxDEV)(`form`,{onSubmit:te,className:`edufyi-login-form`,children:[(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(d,{size:17},void 0,!1,{fileName:x,lineNumber:1012,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:1011,columnNumber:15},this),(0,b.jsxDEV)(`input`,{type:Y?`text`:`password`,className:`edufyi-field-input`,placeholder:`New Password (min 8 characters)`,value:G,onChange:e=>K(e.target.value),autoComplete:`new-password`,disabled:N,autoFocus:!0},void 0,!1,{fileName:x,lineNumber:1014,columnNumber:15},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>X(!Y),tabIndex:-1,children:Y?(0,b.jsxDEV)(f,{size:16},void 0,!1,{fileName:x,lineNumber:1030,columnNumber:36},this):(0,b.jsxDEV)(n,{size:16},void 0,!1,{fileName:x,lineNumber:1030,columnNumber:59},this)},void 0,!1,{fileName:x,lineNumber:1024,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:1010,columnNumber:13},this),(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(u,{size:17},void 0,!1,{fileName:x,lineNumber:1036,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:1035,columnNumber:15},this),(0,b.jsxDEV)(`input`,{type:Y?`text`:`password`,className:`edufyi-field-input`,placeholder:`Confirm New Password`,value:q,onChange:e=>J(e.target.value),autoComplete:`new-password`,disabled:N},void 0,!1,{fileName:x,lineNumber:1038,columnNumber:15},this)]},void 0,!0,{fileName:x,lineNumber:1034,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:N,children:N?`SAVING NEW PASSWORD...`:(0,b.jsxDEV)(b.Fragment,{children:[`SET PASSWORD & ENTER `,(0,b.jsxDEV)(l,{size:16},void 0,!1,{fileName:x,lineNumber:1052,columnNumber:40},this)]},void 0,!0,{fileName:x,lineNumber:1051,columnNumber:17},this)},void 0,!1,{fileName:x,lineNumber:1049,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:1009,columnNumber:11},this):(0,b.jsxDEV)(`form`,{onSubmit:ee,className:`edufyi-login-form`,children:[(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(c,{size:17},void 0,!1,{fileName:x,lineNumber:1062,columnNumber:15},this)},void 0,!1,{fileName:x,lineNumber:1061,columnNumber:13},this),(0,b.jsxDEV)(`input`,{type:`text`,className:`edufyi-field-input`,placeholder:$?`hr@edufyi.in`:`admin@edufyitech.in`,value:T,onChange:e=>E(e.target.value),autoComplete:`username`,disabled:N},void 0,!1,{fileName:x,lineNumber:1064,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:1060,columnNumber:11},this),(0,b.jsxDEV)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsxDEV)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsxDEV)(u,{size:17},void 0,!1,{fileName:x,lineNumber:1077,columnNumber:15},this)},void 0,!1,{fileName:x,lineNumber:1076,columnNumber:13},this),(0,b.jsxDEV)(`input`,{type:k?`text`:`password`,className:`edufyi-field-input`,placeholder:`Master Password`,value:D,onChange:e=>O(e.target.value),autoComplete:`current-password`,disabled:N},void 0,!1,{fileName:x,lineNumber:1079,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>A(!k),tabIndex:-1,"aria-label":k?`Hide password`:`Show password`,children:k?(0,b.jsxDEV)(f,{size:16},void 0,!1,{fileName:x,lineNumber:1095,columnNumber:31},this):(0,b.jsxDEV)(n,{size:16},void 0,!1,{fileName:x,lineNumber:1095,columnNumber:54},this)},void 0,!1,{fileName:x,lineNumber:1088,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:1075,columnNumber:11},this),(0,b.jsxDEV)(`div`,{className:`edufyi-action-row`,children:[(0,b.jsxDEV)(`label`,{className:`edufyi-remember-label`,children:[(0,b.jsxDEV)(`input`,{type:`checkbox`,className:`edufyi-checkbox`,checked:j,onChange:e=>M(e.target.checked)},void 0,!1,{fileName:x,lineNumber:1101,columnNumber:15},this),`Remember me`]},void 0,!0,{fileName:x,lineNumber:1100,columnNumber:13},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-link`,onClick:()=>H(`Master emergency recovery keys are stored securely on the host server environment (.env). Contact System Architecture if recovery is required.`),children:`Recovery Key?`},void 0,!1,{fileName:x,lineNumber:1109,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:1099,columnNumber:11},this),(0,b.jsxDEV)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:N,children:N?`AUTHENTICATING...`:(0,b.jsxDEV)(b.Fragment,{children:[$?`SIGN IN TO HR PORTAL`:`SIGN IN TO ADMIN PORTAL`,` `,(0,b.jsxDEV)(l,{size:16},void 0,!1,{fileName:x,lineNumber:1121,columnNumber:77},this)]},void 0,!0,{fileName:x,lineNumber:1120,columnNumber:15},this)},void 0,!1,{fileName:x,lineNumber:1118,columnNumber:11},this),(0,b.jsxDEV)(`button`,{type:`button`,className:`edufyi-secondary-btn`,onClick:Z,disabled:N||F,children:[(0,b.jsxDEV)(o,{size:16,style:{color:`#00b4d8`}},void 0,!1,{fileName:x,lineNumber:1132,columnNumber:13},this),F?`VERIFYING PASSKEY...`:`Sign in with Passkey / Biometrics`]},void 0,!0,{fileName:x,lineNumber:1126,columnNumber:11},this),(0,b.jsxDEV)(`button`,{type:`button`,onClick:()=>R(!0),style:{background:`transparent`,border:0,color:`#00b4d8`,fontSize:`12px`,fontWeight:600,cursor:`pointer`,padding:`4px 0 0`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`5px`,margin:`0 auto`},children:[(0,b.jsxDEV)(a,{size:13},void 0,!1,{fileName:x,lineNumber:1154,columnNumber:13},this),(0,b.jsxDEV)(`span`,{children:`First time on this device? Add / Register Passkey`},void 0,!1,{fileName:x,lineNumber:1155,columnNumber:13},this)]},void 0,!0,{fileName:x,lineNumber:1136,columnNumber:11},this)]},void 0,!0,{fileName:x,lineNumber:1059,columnNumber:11},this),(0,b.jsxDEV)(g,{isOpen:L,onClose:()=>R(!1),initialEmail:T,initialPassword:D},void 0,!1,{fileName:x,lineNumber:1159,columnNumber:9},this)]},void 0,!0,{fileName:x,lineNumber:950,columnNumber:7},this)]},void 0,!0,{fileName:x,lineNumber:948,columnNumber:5},this)}function T({route:e}){let t=typeof window<`u`?(window.location.hash||``).toLowerCase():``,n=(e?.path||``).toLowerCase();return n===`/admin/login`||t.includes(`/admin/login`)||t.startsWith(`#/admin`)?(0,b.jsxDEV)(w,{defaultRole:`admin`},void 0,!1,{fileName:x,lineNumber:1181,columnNumber:12},this):n===`/hr/login`||t.includes(`/hr/login`)||t.startsWith(`#/hr`)?(0,b.jsxDEV)(w,{defaultRole:`hr`},void 0,!1,{fileName:x,lineNumber:1186,columnNumber:12},this):(0,b.jsxDEV)(C,{},void 0,!1,{fileName:x,lineNumber:1191,columnNumber:10},this)}export{T as LoginPage};