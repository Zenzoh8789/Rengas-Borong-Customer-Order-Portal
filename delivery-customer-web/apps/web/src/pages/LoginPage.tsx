import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Phone } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState(
    (location.state as { phoneNumber?: string } | null)?.phoneNumber ?? "",
  );
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { loginCustomerWithPassword, sendOtp, verifyOtp } = useApp();
  const navigate = useNavigate();

  const submitPhone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await loginCustomerWithPassword(phoneNumber.trim(), password)) {
      navigate("/", { replace: true, state: { showWelcome: true } });
    }
  };

  const requestOtp = async () => {
    if (await sendOtp(phoneNumber.trim())) setOtpSent(true);
  };

  const confirmOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await verifyOtp(phoneNumber.trim(), otp)) {
      navigate("/", { replace: true, state: { showWelcome: true } });
    }
  };

  return (
    <main className="auth-screen">
      <form className="auth-card auth-login-card" onSubmit={otpSent ? confirmOtp : submitPhone}>
        {otpSent && (
          <button
            type="button"
            className="auth-back"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
          >
            <ArrowLeft size={19} /> Change phone number
          </button>
        )}

        <div className="auth-logo"><BrandLogo size={112} /></div>
        <div className="auth-heading">
          <h1>{otpSent ? "Confirm OTP" : "Welcome Back"}</h1>
          <p>{otpSent ? `Enter the 6-digit code sent to ${phoneNumber}` : "Sign in to continue"}</p>
        </div>

        {!otpSent ? (
          <>
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
                  required
                />
              </span>
            </label>
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
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
          </>
        ) : (
          <label className="auth-field">
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

        <button className="auth-submit" type="submit">
          {otpSent ? "Confirm & Sign In" : "Sign In"}
        </button>

        {otpSent ? (
          <p className="auth-note">
            Didn&apos;t receive it? <button type="button" className="auth-link-button" onClick={() => sendOtp(phoneNumber.trim())}>Resend OTP</button>
          </p>
        ) : (
          <button className="otp-alternative" type="button" onClick={requestOtp}>
            Continue with OTP
          </button>
        )}

        <p className="auth-switch">New to Renga Borong? <Link to="/signup">Create an account</Link></p>
      </form>
    </main>
  );
}
