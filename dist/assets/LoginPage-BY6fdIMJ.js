import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{D as t,Et as n,Lt as r,Tt as i,U as a,ft as o,in as s,it as c,nt as l,sn as u,w as d,yt as f}from"./icons-vendor-B-dchJE-.js";import{a as p}from"./motion-vendor-S7BVbNQl.js";import{d as m,f as h,l as g,u as _,y as v}from"./index-CZFF7NIz.js";var y=e(u(),1),b=p();function x(){return(0,b.jsx)(`style`,{children:`
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
    `})}function S(){let{login:e,changePassword:t,completeSession:u}=v(),[p,S]=(0,y.useState)(``),[C,w]=(0,y.useState)(``),[T,E]=(0,y.useState)(!1),[D,O]=(0,y.useState)(!0),[k,A]=(0,y.useState)(!1),[j,M]=(0,y.useState)(!1),[N,P]=(0,y.useState)(!1),[F,I]=(0,y.useState)(``),[L,R]=(0,y.useState)(``),[z,B]=(0,y.useState)(!1),[V,H]=(0,y.useState)(``),[U,W]=(0,y.useState)(``),[G,K]=(0,y.useState)(!1);async function q(){if(I(``),R(``),!_())I(`Biometric Passkeys (Touch ID, Windows Hello, Face ID) are not supported on this browser.`);else{M(!0);try{let e=await m({email:p.trim(),portal:`employee`});e.token&&e.user&&(u(e.token,e.user),window.location.hash=`#/employee`)}catch(e){if(e.name===`NotAllowedError`)I(`Passkey prompt was cancelled.`);else if(e.code===`NO_PASSKEY_REGISTERED`||e.message?.includes(`No registered passkey`)){if(C&&p.trim())try{R(`Registering this device as your trusted passkey...`);let e=await h({email:p.trim(),password:C,deviceName:navigator.userAgent.includes(`Windows`)?`Windows Hello`:`Biometric Key`});if(e.token&&e.user){u(e.token,e.user),window.location.hash=`#/employee`;return}}catch(e){I(e.message||`Passkey registration cancelled.`)}else I(`No passkey registered for this account yet. Please enter your password once to register your device.`)}else I(e.message||`Passkey verification failed.`)}finally{M(!1),R(``)}}}async function J(t){if(t&&t.preventDefault(),I(``),R(``),!p.trim()||!C)I(`Please enter your work email, username, or employee ID and password.`);else{A(!0);try{let t=await e(p.trim(),C,`employee`);if(t?.role===`admin`||t?.role===`hr`)throw Error(`Access denied: Management accounts must log in via the HR / Admin Console.`);if(t?.mustChangePassword){B(!0),R(`First-time login detected: An auto-generated temporary password was used. Please set a new password below.`);return}window.location.hash=`#/employee`}catch(e){I(e.message||`Invalid email or password.`)}finally{A(!1)}}}async function Y(e){if(e&&e.preventDefault(),I(``),!V||V.trim().length<8)I(`New password must be at least 8 characters long.`);else if(V!==U)I(`New password and confirmation do not match.`);else if(V===C)I(`New password must be different from your temporary password.`);else{A(!0);try{await t({currentPassword:C,newPassword:V.trim()}),window.location.hash=`#/employee`}catch(e){I(e?.message||`Failed to set new password. Please try again.`)}finally{A(!1)}}}return(0,b.jsxs)(`div`,{className:`edufyi-login-root`,children:[(0,b.jsx)(x,{}),(0,b.jsxs)(`div`,{className:`edufyi-login-card`,children:[(0,b.jsx)(`img`,{src:`/elythra-edufyitech-logo.png`,alt:`Elythra EdufyiTech`,className:`edufyi-brand-logo`}),(0,b.jsxs)(`div`,{className:`edufyi-pill-badge`,children:[(0,b.jsx)(d,{size:13,style:{color:`#00d2ff`}}),(0,b.jsx)(`span`,{children:z?`SECURITY SETUP`:`EMPLOYEE SELF-SERVICE`})]}),(0,b.jsx)(`h1`,{className:`edufyi-login-title`,children:z?`Set New Password`:`Employee Login`}),(0,b.jsx)(`p`,{className:`edufyi-login-subtitle`,children:z?`Choose a permanent personal password to secure your account`:`Sign in with your Admin or HR-created account`}),F&&(0,b.jsxs)(`div`,{className:`edufyi-error-box`,children:[(0,b.jsx)(r,{size:15,style:{flexShrink:0}}),(0,b.jsx)(`span`,{children:F})]}),L&&(0,b.jsxs)(`div`,{className:`edufyi-notice-box`,children:[(0,b.jsx)(d,{size:15,style:{flexShrink:0}}),(0,b.jsx)(`span`,{children:L})]}),z?(0,b.jsxs)(`form`,{onSubmit:Y,className:`edufyi-login-form`,children:[(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(o,{size:17})}),(0,b.jsx)(`input`,{type:G?`text`:`password`,className:`edufyi-field-input`,placeholder:`New Password (min 8 characters)`,value:V,onChange:e=>H(e.target.value),autoComplete:`new-password`,disabled:k,autoFocus:!0}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>K(!G),tabIndex:-1,children:G?(0,b.jsx)(n,{size:16}):(0,b.jsx)(i,{size:16})})]}),(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(c,{size:17})}),(0,b.jsx)(`input`,{type:G?`text`:`password`,className:`edufyi-field-input`,placeholder:`Confirm New Password`,value:U,onChange:e=>W(e.target.value),autoComplete:`new-password`,disabled:k})]}),(0,b.jsx)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:k,children:k?`SAVING NEW PASSWORD...`:(0,b.jsxs)(b.Fragment,{children:[`SAVE PASSWORD & ENTER `,(0,b.jsx)(s,{size:16})]})})]}):(0,b.jsxs)(`form`,{onSubmit:J,className:`edufyi-login-form`,children:[(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(l,{size:17})}),(0,b.jsx)(`input`,{type:`text`,className:`edufyi-field-input`,placeholder:`Work Email, Username or Employee ID`,value:p,onChange:e=>S(e.target.value),autoComplete:`username`,disabled:k})]}),(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(c,{size:17})}),(0,b.jsx)(`input`,{type:T?`text`:`password`,className:`edufyi-field-input`,placeholder:`Password`,value:C,onChange:e=>w(e.target.value),autoComplete:`current-password`,disabled:k}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>E(!T),tabIndex:-1,"aria-label":T?`Hide password`:`Show password`,children:T?(0,b.jsx)(n,{size:16}):(0,b.jsx)(i,{size:16})})]}),(0,b.jsxs)(`div`,{className:`edufyi-action-row`,children:[(0,b.jsxs)(`label`,{className:`edufyi-remember-label`,children:[(0,b.jsx)(`input`,{type:`checkbox`,className:`edufyi-checkbox`,checked:D,onChange:e=>O(e.target.checked)}),`Remember me`]}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-link`,onClick:()=>R(`For account recovery, password resets, or credentials lookup, please reach out to your HR Operations team.`),children:`Forgot password?`})]}),(0,b.jsx)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:k,children:k?`SIGNING IN...`:(0,b.jsxs)(b.Fragment,{children:[`SIGN IN `,(0,b.jsx)(s,{size:16})]})}),(0,b.jsxs)(`button`,{type:`button`,className:`edufyi-secondary-btn`,onClick:q,disabled:k||j,children:[(0,b.jsx)(f,{size:17,style:{color:`#00d2ff`}}),j?`VERIFYING PASSKEY...`:`Sign in with Passkey / Biometrics`]}),(0,b.jsxs)(`button`,{type:`button`,onClick:()=>P(!0),style:{background:`transparent`,border:0,color:`#00d2ff`,fontSize:`12px`,fontWeight:600,cursor:`pointer`,padding:`4px 0 0`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`5px`,margin:`0 auto`},children:[(0,b.jsx)(a,{size:13}),(0,b.jsx)(`span`,{children:`First time on this device? Add / Register Passkey`})]})]}),(0,b.jsx)(g,{isOpen:N,onClose:()=>P(!1),initialEmail:p,initialPassword:C})]})]})}function C({defaultRole:e=`hr`}){let{login:u,changePassword:d,completeSession:p}=v(),[S,C]=(0,y.useState)(()=>typeof window<`u`&&window.location.hash.includes(`admin`)?`admin`:e),[w,T]=(0,y.useState)(()=>S===`admin`?`admin@edufyitech.in`:`hr@edufyi.in`),[E,D]=(0,y.useState)(``),[O,k]=(0,y.useState)(!1),[A,j]=(0,y.useState)(!0),[M,N]=(0,y.useState)(!1),[P,F]=(0,y.useState)(!1),[I,L]=(0,y.useState)(!1),[R,z]=(0,y.useState)(``),[B,V]=(0,y.useState)(``),[H,U]=(0,y.useState)(!1),[W,G]=(0,y.useState)(``),[K,q]=(0,y.useState)(``),[J,Y]=(0,y.useState)(!1);async function X(){if(z(``),V(``),!_())z(`Biometric Passkeys (Touch ID, Windows Hello, Face ID) are not supported on this browser.`);else{F(!0);try{let e=await m({email:w.trim(),portal:S});e.token&&e.user&&(p(e.token,e.user),window.location.hash=S===`admin`?`#/admin`:`#/hr`)}catch(e){if(e.name===`NotAllowedError`)z(`Passkey prompt was cancelled.`);else if(e.code===`NO_PASSKEY_REGISTERED`||e.message?.includes(`No registered passkey`)){if(E&&w.trim())try{V(`Registering this device as your trusted passkey...`);let e=await h({email:w.trim(),password:E,deviceName:navigator.userAgent.includes(`Windows`)?`Windows Hello`:`Biometric Key`});if(e.token&&e.user){p(e.token,e.user),window.location.hash=S===`admin`?`#/admin`:`#/hr`;return}}catch(e){z(e.message||`Passkey registration cancelled.`)}else z(`No passkey registered for this account yet. Please enter your password once to register your device.`)}else z(e.message||`Passkey verification failed.`)}finally{F(!1),V(``)}}}(0,y.useEffect)(()=>{let e=()=>{let e=window.location.hash||``;e.includes(`admin`)?(C(`admin`),T(e=>!e||e===`hr@edufyi.in`||e===`hr@edufyitech.in`?`admin@edufyitech.in`:e)):e.includes(`hr`)&&(C(`hr`),T(e=>!e||e===`admin@edufyitech.in`||e===`admin@edufyi.in`?`hr@edufyi.in`:e))};return e(),window.addEventListener(`hashchange`,e),()=>window.removeEventListener(`hashchange`,e)},[]);function Z(e){C(e),z(``),V(``),e===`admin`?(w&&w!==`hr@edufyi.in`&&w!==`hr@edufyitech.in`||T(`admin@edufyitech.in`),window.location.hash=`#/admin/login`):(w&&w!==`admin@edufyitech.in`&&w!==`admin@edufyi.in`||T(`hr@edufyi.in`),window.location.hash=`#/hr/login`)}async function Q(e){if(e&&e.preventDefault(),z(``),V(``),!w.trim()||!E)z(S===`admin`?`Please enter your administrator email and password.`:`Please enter your HR operational email and password.`);else{N(!0);try{let e=S===`admin`?`admin`:`hr`,t=await u(w.trim(),E,e);if(t?.mustChangePassword){U(!0),V(`First-time login detected: An auto-generated temporary password was used. Please set a new password below.`);return}if(t?.role===`admin`)window.location.hash=`#/admin`;else if(t?.role===`hr`)window.location.hash=`#/hr`;else throw Error(`Access denied: Employee accounts cannot sign into the HR or Admin Management Console.`)}catch(e){z(e.message||`Invalid email or password.`)}finally{N(!1)}}}async function ee(e){if(e&&e.preventDefault(),z(``),!W||W.trim().length<8)z(`New password must be at least 8 characters long.`);else if(W!==K)z(`New password and confirmation do not match.`);else if(W===E)z(`New password must be different from your temporary password.`);else{N(!0);try{await d({currentPassword:E,newPassword:W.trim()}),window.location.hash=S===`admin`?`#/admin`:`#/hr`}catch(e){z(e?.message||`Failed to set new password. Please try again.`)}finally{N(!1)}}}let $=S===`hr`;return(0,b.jsxs)(`div`,{className:`edufyi-login-root`,children:[(0,b.jsx)(x,{}),(0,b.jsxs)(`div`,{className:`edufyi-login-card`,children:[(0,b.jsx)(`img`,{src:`/elythra-edufyitech-logo.png`,alt:`Elythra EdufyiTech`,className:`edufyi-brand-logo`}),(0,b.jsxs)(`div`,{className:`edufyi-pill-badge`,children:[(0,b.jsx)(t,{size:13,style:{color:`#00d2ff`}}),(0,b.jsx)(`span`,{children:$?`HR OPERATIONS`:`ADMIN CONSOLE`})]}),(0,b.jsx)(`h1`,{className:`edufyi-login-title`,children:$?`HR Operations Sign In`:`Admin Terminal Sign In`}),(0,b.jsx)(`p`,{className:`edufyi-login-subtitle`,children:$?`People Operations & Workforce Management (Employee accounts not permitted)`:`Executive System Administration & Global Configuration (Employee accounts not permitted)`}),(0,b.jsxs)(`div`,{className:`edufyi-mgmt-tabs`,children:[(0,b.jsx)(`button`,{type:`button`,className:`edufyi-mgmt-tab ${$?``:`active`}`,onClick:()=>Z(`admin`),children:`Admin Terminal`}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-mgmt-tab ${$?`active`:``}`,onClick:()=>Z(`hr`),children:`HR Operations`})]}),R&&(0,b.jsxs)(`div`,{className:`edufyi-error-box`,children:[(0,b.jsx)(r,{size:15,style:{flexShrink:0}}),(0,b.jsx)(`span`,{children:R})]}),B&&(0,b.jsxs)(`div`,{className:`edufyi-notice-box`,children:[(0,b.jsx)(t,{size:15,style:{flexShrink:0}}),(0,b.jsx)(`span`,{children:B})]}),H?(0,b.jsxs)(`form`,{onSubmit:ee,className:`edufyi-login-form`,children:[(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(o,{size:17})}),(0,b.jsx)(`input`,{type:J?`text`:`password`,className:`edufyi-field-input`,placeholder:`New Password (min 8 characters)`,value:W,onChange:e=>G(e.target.value),autoComplete:`new-password`,disabled:M,autoFocus:!0}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>Y(!J),tabIndex:-1,children:J?(0,b.jsx)(n,{size:16}):(0,b.jsx)(i,{size:16})})]}),(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(c,{size:17})}),(0,b.jsx)(`input`,{type:J?`text`:`password`,className:`edufyi-field-input`,placeholder:`Confirm New Password`,value:K,onChange:e=>q(e.target.value),autoComplete:`new-password`,disabled:M})]}),(0,b.jsx)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:M,children:M?`SAVING NEW PASSWORD...`:(0,b.jsxs)(b.Fragment,{children:[`SET PASSWORD & ENTER `,(0,b.jsx)(s,{size:16})]})})]}):(0,b.jsxs)(`form`,{onSubmit:Q,className:`edufyi-login-form`,children:[(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(l,{size:17})}),(0,b.jsx)(`input`,{type:`text`,className:`edufyi-field-input`,placeholder:$?`hr@edufyi.in`:`admin@edufyitech.in`,value:w,onChange:e=>T(e.target.value),autoComplete:`username`,disabled:M})]}),(0,b.jsxs)(`div`,{className:`edufyi-field-box`,children:[(0,b.jsx)(`span`,{className:`edufyi-field-icon`,children:(0,b.jsx)(c,{size:17})}),(0,b.jsx)(`input`,{type:O?`text`:`password`,className:`edufyi-field-input`,placeholder:`Master Password`,value:E,onChange:e=>D(e.target.value),autoComplete:`current-password`,disabled:M}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-eye-toggle`,onClick:()=>k(!O),tabIndex:-1,"aria-label":O?`Hide password`:`Show password`,children:O?(0,b.jsx)(n,{size:16}):(0,b.jsx)(i,{size:16})})]}),(0,b.jsxs)(`div`,{className:`edufyi-action-row`,children:[(0,b.jsxs)(`label`,{className:`edufyi-remember-label`,children:[(0,b.jsx)(`input`,{type:`checkbox`,className:`edufyi-checkbox`,checked:A,onChange:e=>j(e.target.checked)}),`Remember me`]}),(0,b.jsx)(`button`,{type:`button`,className:`edufyi-link`,onClick:()=>V(`Master emergency recovery keys are stored securely on the host server environment (.env). Contact System Architecture if recovery is required.`),children:`Recovery Key?`})]}),(0,b.jsx)(`button`,{type:`submit`,className:`edufyi-primary-btn`,disabled:M,children:M?`AUTHENTICATING...`:(0,b.jsxs)(b.Fragment,{children:[$?`SIGN IN TO HR PORTAL`:`SIGN IN TO ADMIN PORTAL`,` `,(0,b.jsx)(s,{size:16})]})}),(0,b.jsxs)(`button`,{type:`button`,className:`edufyi-secondary-btn`,onClick:X,disabled:M||P,children:[(0,b.jsx)(f,{size:16,style:{color:`#00b4d8`}}),P?`VERIFYING PASSKEY...`:`Sign in with Passkey / Biometrics`]}),(0,b.jsxs)(`button`,{type:`button`,onClick:()=>L(!0),style:{background:`transparent`,border:0,color:`#00b4d8`,fontSize:`12px`,fontWeight:600,cursor:`pointer`,padding:`4px 0 0`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`5px`,margin:`0 auto`},children:[(0,b.jsx)(a,{size:13}),(0,b.jsx)(`span`,{children:`First time on this device? Add / Register Passkey`})]})]}),(0,b.jsx)(g,{isOpen:I,onClose:()=>L(!1),initialEmail:w,initialPassword:E})]})]})}function w({route:e}){let t=typeof window<`u`?(window.location.hash||``).toLowerCase():``,n=(e?.path||``).toLowerCase();return n===`/admin/login`||t.includes(`/admin/login`)||t.startsWith(`#/admin`)?(0,b.jsx)(C,{defaultRole:`admin`}):n===`/hr/login`||t.includes(`/hr/login`)||t.startsWith(`#/hr`)?(0,b.jsx)(C,{defaultRole:`hr`}):(0,b.jsx)(S,{})}export{w as LoginPage};