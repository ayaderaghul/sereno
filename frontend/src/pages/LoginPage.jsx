import { useState } from "react";
import API from "../api.js"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext.jsx"
const translations = {
  en: {
    appName: "Sereno",
    tagline: "Your quiet space to reflect",
    loginTitle: "Welcome back",
    loginSub: "Continue your journey",
    registerTitle: "Begin your journey",
    registerSub: "A quiet space, just for you",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    loginBtn: "Sign in",
    registerBtn: "Create account",
    switchToRegister: "New here? Create an account",
    switchToLogin: "Already have an account? Sign in",
    forgotPassword: "Forgot password?",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "••••••••",
    confirmPlaceholder: "••••••••",
    errorEmail: "Please enter a valid email",
    errorPassword: "Password must be at least 8 characters",
    errorMatch: "Passwords do not match",
    loading: "Please wait...",
    toggleLang: "IT",
    orDivider: "or",
    privacyNote: "Your entries may be processed by third party AI (Google API, Hugging Face).",
  },
  it: {
    appName: "Sereno",
    tagline: "Il tuo spazio tranquillo per riflettere",
    loginTitle: "Bentornato",
    loginSub: "Continua il tuo percorso",
    registerTitle: "Inizia il tuo percorso",
    registerSub: "Uno spazio tranquillo, solo per te",
    email: "Email",
    password: "Password",
    confirmPassword: "Conferma password",
    loginBtn: "Accedi",
    registerBtn: "Crea account",
    switchToRegister: "Sei nuovo? Crea un account",
    switchToLogin: "Hai già un account? Accedi",
    forgotPassword: "Password dimenticata?",
    emailPlaceholder: "tua@email.com",
    passwordPlaceholder: "••••••••",
    confirmPlaceholder: "••••••••",
    errorEmail: "Inserisci un'email valida",
    errorPassword: "La password deve avere almeno 8 caratteri",
    errorMatch: "Le password non coincidono",
    loading: "Attendere...",
    toggleLang: "EN",
    orDivider: "oppure",
    privacyNote: "Le tue voci potrebbero essere elaborate da un'intelligenza artificiale di terze parti (API di Google, Hugging Face).",
  },
};

export default function Login() {
  const {login,register} = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [success, setSuccess] = useState(false);

  const t = translations[lang];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    :root {
      --bg: ${dark ? "#0f0f13" : "#f8f6f1"};
      --card: ${dark ? "#1a1a22" : "#ffffff"};
      --card2: ${dark ? "#22222d" : "#f0ede6"};
      --text: ${dark ? "#e8e4dc" : "#2a2420"};
      --muted: ${dark ? "#6b6880" : "#9e9589"};
      --border: ${dark ? "#2e2e3a" : "#e8e3da"};
      --accent: ${dark ? "#a78bfa" : "#7c6fcd"};
      --accent-soft: ${dark ? "rgba(167,139,250,0.1)" : "rgba(124,111,205,0.08)"};
      --neg: #f87171;
      --pos: #4ade80;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

    .auth-wrap {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 20px;
      position: relative;
    }

    .bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    .bg-orb-1 {
      width: 300px; height: 300px;
      top: -60px; left: -80px;
      background: ${dark ? "rgba(167,139,250,0.06)" : "rgba(124,111,205,0.07)"};
    }
    .bg-orb-2 {
      width: 200px; height: 200px;
      bottom: 40px; right: -40px;
      background: ${dark ? "rgba(52,211,153,0.05)" : "rgba(5,150,105,0.05)"};
    }

    .auth-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }

    .toggle-btn {
      background: var(--card2);
      border: 1px solid var(--border);
      color: var(--muted);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .toggle-btn:hover { color: var(--text); border-color: var(--accent); }

    .auth-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px 36px;
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 1;
      transition: all 0.3s;
    }

    .auth-logo-wrap {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 300;
      letter-spacing: 4px;
      color: var(--text);
      line-height: 1;
    }
    .auth-tagline {
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 6px;
    }

    .auth-divider {
      width: 32px;
      height: 1px;
      background: var(--border);
      margin: 20px auto;
    }

    .auth-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 400;
      color: var(--text);
      text-align: center;
      margin-bottom: 4px;
    }
    .auth-sub {
      font-size: 12px;
      color: var(--muted);
      text-align: center;
      margin-bottom: 28px;
      letter-spacing: 0.3px;
    }

    .field {
      margin-bottom: 16px;
    }
    .field label {
      display: block;
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .field input {
      width: 100%;
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field input::placeholder { color: var(--muted); }
    .field input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .field input.error {
      border-color: var(--neg);
      box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
    }
    .field-error {
      font-size: 11px;
      color: var(--neg);
      margin-top: 5px;
      padding-left: 4px;
    }

    .forgot {
      text-align: right;
      margin-top: -8px;
      margin-bottom: 20px;
    }
    .forgot button {
      background: none;
      border: none;
      font-size: 11px;
      color: var(--muted);
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: color 0.2s;
    }
    .forgot button:hover { color: var(--accent); }

    .submit-btn {
      width: 100%;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: opacity 0.2s, transform 0.15s;
      margin-top: 4px;
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
    .submit-btn:active { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .switch-mode {
      text-align: center;
      margin-top: 20px;
    }
    .switch-mode button {
      background: none;
      border: none;
      font-size: 12px;
      color: var(--muted);
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: color 0.2s;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .switch-mode button:hover { color: var(--accent); }

    .privacy-note {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      margin-top: 20px;
    }
    .privacy-note span {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.5;
    }
    .privacy-icon { font-size: 14px; flex-shrink: 0; }

    .success-wrap {
      text-align: center;
      padding: 20px 0;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }
    .success-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px;
      font-weight: 400;
      color: var(--text);
      margin-bottom: 8px;
    }
    .success-sub {
      font-size: 13px;
      color: var(--muted);
    }

    .loading-dots span {
      animation: blink 1.4s infinite;
      font-size: 20px;
    }
    .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.2; }
      40% { opacity: 1; }
    }

    .slide-in {
      animation: slideIn 0.25s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = t.errorEmail;
    if (form.password.length < 6) e.password = t.errorPassword;
    if (mode === "register" && form.password !== form.confirm) e.confirm = t.errorMatch;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await login(form.email, form.password)
        setSuccess(true)
      } else {
        console.log(form)
        await register({email: form.email, password: form.password})
        setSuccess(true)
      }
    }catch(err){
      setErrors({email: err.message})
    } finally {
      setLoading(false)
    }

    setTimeout(() =>{
      navigate("/", {replace: true})
    },1200)
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    setForm({ email: "", password: "", confirm: "" });
    setSuccess(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        <div className="auth-controls">
          <button className="toggle-btn" onClick={() => setLang(lang === "en" ? "it" : "en")}>{t.toggleLang}</button>
          <button className="toggle-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
        </div>

        <div className="auth-card slide-in">
          <div className="auth-logo-wrap">
            <div className="auth-logo">{t.appName}</div>
            <div className="auth-tagline">{t.tagline}</div>
          </div>

          <div className="auth-divider" />

          {success ? (
            <div className="success-wrap">
              <span className="success-icon">✦</span>
              <div className="success-title">
                {mode === "login" ? (lang === "it" ? "Bentornato" : "Welcome back") : (lang === "it" ? "Benvenuto" : "Welcome")}
              </div>
              <div className="success-sub">
                {lang === "it" ? "Accesso riuscito..." : "Signing you in..."}
              </div>
              <div className="loading-dots" style={{ marginTop: 16 }}>
                <span>·</span><span>·</span><span>·</span>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-title">{mode === "login" ? t.loginTitle : t.registerTitle}</div>
              <div className="auth-sub">{mode === "login" ? t.loginSub : t.registerSub}</div>

              <div className="field">
                <label>{t.email}</label>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="field">
                <label>{t.password}</label>
                <input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              {mode === "register" && (
                <div className="field">
                  <label>{t.confirmPassword}</label>
                  <input
                    type="password"
                    placeholder={t.confirmPlaceholder}
                    value={form.confirm}
                    onChange={e => handleChange("confirm", e.target.value)}
                    className={errors.confirm ? "error" : ""}
                  />
                  {errors.confirm && <div className="field-error">{errors.confirm}</div>}
                </div>
              )}

              {mode === "login" && (
                <div className="forgot">
                  <button>{t.forgotPassword}</button>
                </div>
              )}

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? t.loading : (mode === "login" ? t.loginBtn : t.registerBtn)}
              </button>

              <div className="switch-mode">
                <button onClick={switchMode}>
                  {mode === "login" ? t.switchToRegister : t.switchToLogin}
                </button>
              </div>

              <div className="privacy-note">
                <span className="privacy-icon">🔒</span>
                <span>{t.privacyNote}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}