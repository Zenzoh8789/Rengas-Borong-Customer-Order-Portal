import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Phone } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { useApp } from "../context/AppContext";

type AuthMode = "login" | "otp" | "forgot-phone" | "forgot-otp" | "forgot-password";

export function LoginPage() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try { await action(); } finally { pending.current = false; setBusy(false); }
  };

  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState(
    (location.state as { phoneNumber?: string } | null)?.phoneNumber ?? "",
  );
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [resetToken, setResetToken] = useState("");
  const [developmentOtp, setDevelopmentOtp] = useState("");
  const [resetDelivery, setResetDelivery] = useState("email");
  const { loginCustomerWithPassword, sendOtp, verifyOtp, requestPasswordReset, verifyPasswordResetOtp, resetPassword, notify } = useApp();
  const navigate = useNavigate();

  const goToLogin = () => {
    setMode("login");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setResetToken("");
    setDevelopmentOtp("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await run(async () => {
      if (await loginCustomerWithPassword(phoneNumber.trim(), password)) {
        navigate("/", { replace: true, state: { showWelcome: true } });
      }
    });
  };

  const requestLoginOtp = async () => {
    await run(async () => {
      if (await sendOtp(phoneNumber.trim())) setMode("otp");
    });
  };

  const confirmLoginOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await run(async () => {
      if (await verifyOtp(phoneNumber.trim(), otp)) {
        navigate("/", { replace: true, state: { showWelcome: true } });
      }
    });
  };

  const sendResetOtp = async () => {
    await run(async () => {
      const result = await requestPasswordReset(phoneNumber.trim());
      if (result) {
        setDevelopmentOtp(result.developmentOtp ?? "");
        setResetDelivery(result.delivery ?? (result.developmentOtp ? "development" : "email"));
        setResetToken("");
        setOtp("");
        setMode("forgot-otp");
      }
    });
  };

  const requestResetOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendResetOtp();
  };

  const confirmResetOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await run(async () => {
      const token = await verifyPasswordResetOtp(phoneNumber.trim(), otp);
      if (token) {
        setResetToken(token);
        setDevelopmentOtp("");
        setOtp("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setPassword("");
        setConfirmPassword("");
        setMode("forgot-password");
      }
    });
  };

  const submitNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetToken) {
      notify("Please verify a new reset OTP first.", "error");
      setMode("forgot-phone");
      return;
    }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      notify("Use at least 8 characters and no more than 72 UTF-8 bytes.", "error");
      return;
    }
    if (password !== confirmPassword) {
      notify("Passwords do not match.", "error");
      return;
    }
    await run(async () => {
      if (await resetPassword(resetToken, password)) goToLogin();
    });
  };

  const isForgotFlow = mode.startsWith("forgot-");
  const heading = mode === "login"
    ? <>Welcome to<br />RENGAS BORONG</>
    : mode === "otp"
      ? "Confirm OTP"
      : mode === "forgot-phone"
        ? "Forgot Password"
        : mode === "forgot-otp"
          ? "Verify Reset OTP"
          : "Create New Password";

  const submitHandler = mode === "login"
    ? submitLogin
    : mode === "otp"
      ? confirmLoginOtp
      : mode === "forgot-phone"
        ? requestResetOtp
        : mode === "forgot-otp"
          ? confirmResetOtp
          : submitNewPassword;

  return (
    <main className="auth-screen">
      <form className="auth-card auth-login-card" onSubmit={submitHandler}>
        {mode !== "login" && (
          <button
            type="button"
            className="auth-back"
            disabled={busy}
            onClick={() => {
              if (mode === "otp") setMode("login");
              else if (mode === "forgot-phone") goToLogin();
              else if (mode === "forgot-otp") setMode("forgot-phone");
              else {
                goToLogin();
                setMode("forgot-phone");
              }
            }}
          >
            <ArrowLeft size={19} />
            {mode === "otp" || mode === "forgot-phone" ? "Back to sign in" : "Back"}
          </button>
        )}

        <div className="auth-logo"><BrandLogo size={112} /></div>
        <div className="auth-heading">
          <h1>{heading}</h1>
          {isForgotFlow && (
            <p>
              {mode === "forgot-phone" && "Enter your registered phone number to request a password reset code."}
              {mode === "forgot-otp" && (resetDelivery === "development" ? "Enter the test code displayed below." : resetDelivery === "sms" ? "Enter the 6-digit code sent to your registered phone." : "Enter the 6-digit code sent to your registered email. Check your inbox and spam folder.")}
              {mode === "forgot-password" && "Choose a new password for your account."}
            </p>
          )}
        </div>

        {(mode === "login" || mode === "otp" || mode === "forgot-phone" || mode === "forgot-otp") && (
          <label className="auth-field">
            <span>Phone Number</span>
            <span className="auth-input">
              <Phone size={18} />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="Enter your phone number"
                disabled={busy || mode === "otp" || mode === "forgot-otp"}
                required
              />
            </span>
          </label>
        )}

        {mode === "login" && (
          <label className="auth-field login-password-field">
            <span>Password</span>
            <span className="auth-input">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                minLength={8}
                required
              />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
        )}

        {(mode === "otp" || mode === "forgot-otp") && (
          <label className="auth-field login-password-field">
            <span>One-Time Password</span>
            <span className="auth-input otp-input">
              <KeyRound size={18} />
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                required
              />
            </span>
          </label>
        )}

        {mode === "forgot-password" && (
          <>
            <label className="auth-field">
              <span>New Password</span>
              <span className="auth-input">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your new password"
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <label className="auth-field login-password-field">
              <span>Confirm Password</span>
              <span className="auth-input">
                <LockKeyhole size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your new password"
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button className="password-toggle" type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
          </>
        )}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? "Please wait…" :
            mode === "login" ? "Sign In" :
              mode === "otp" ? "Confirm & Sign In" :
                mode === "forgot-phone" ? "Send Reset OTP" :
                  mode === "forgot-otp" ? "Verify OTP" : "Reset Password"}
        </button>

        {mode === "login" && (
          <>
            <button type="button" className="auth-forgot-link" disabled={busy} onClick={() => { goToLogin(); setMode("forgot-phone"); }}>
              Forgot password?
            </button>
            <button className="otp-alternative" type="button" disabled={busy} onClick={requestLoginOtp}>
              Continue with OTP
            </button>
          </>
        )}

        {mode === "otp" && (
          <p className="auth-note">
            Didn&apos;t receive it? <button type="button" className="auth-link-button" disabled={busy} onClick={requestLoginOtp}>Resend OTP</button>
          </p>
        )}

        {mode === "forgot-otp" && (
          <p className="auth-note">
            Didn&apos;t receive it? <button type="button" className="auth-link-button" disabled={busy} onClick={sendResetOtp}>Resend OTP</button>
          </p>
        )}

        {mode === "forgot-otp" && developmentOtp && (
          <p className="auth-note" role="status">Test mode — no email or SMS was sent. Your reset code: <strong>{developmentOtp}</strong></p>
        )}

        {mode === "forgot-password" && (
          <p className="auth-note">Use at least 8 characters. Submit within 10 minutes of verification. If expired, go back and request a new code.</p>
        )}

        {(mode === "login" || mode === "otp") && (
          <p className="auth-switch">New to Renga Borong? <Link to="/signup">Create an account</Link></p>
        )}
      </form>
    </main>
  );
}
