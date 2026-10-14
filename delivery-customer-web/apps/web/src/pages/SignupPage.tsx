import {
ArrowLeft,
Building2,
Eye,
EyeOff,
FileText,
LockKeyhole,
Mail,
MapPin,
Phone,
UserRound,
} from "lucide-react";
import { useRef,useState,type FormEvent,type ReactNode } from "react";
import { Link,useNavigate,useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BrandLogo } from "../components/BrandLogo";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { CountryCodePicker } from "../components/CountryCodePicker";

export function SignupPage() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const { signUp } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedReturn = (location.state as { returnTo?: string } | null)?.returnTo;
  const returnTo = ["/cart", "/orders", "/account"].includes(requestedReturn ?? "") ? requestedReturn! : "/";
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [country, setCountry] = useState<CountryCode>("MY");
  const [localPhone, setLocalPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [testOtp, setTestOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const requestCode = async () => {
    const digits = localPhone.replace(/\D/g, "").replace(/^0+/, "");
    const number = `+${getCountryCallingCode(country)}${digits}`;
    if (!digits || number.length < 9 || number.length > 16) {
      setError("Enter a valid phone number.");
      return;
    }
    setPhoneNumber(number);
    const result = await api.sendRegistrationOtp(number);
    setVerificationToken("");
    setDeliveryMessage(result.message);
    setTestOtp(result.developmentOtp ?? "");
    setOtp("");
    setStep("otp");
  };

  const verifyPhone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (step === "phone") await requestCode();
      else {
        const verified = await api.verifyRegistrationOtp(phoneNumber, otp);
        setVerificationToken(verified.verificationToken);
        setWhatsappNumber(phoneNumber);
        setTestOtp("");
        setStep("details");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify your phone. Please try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setError("");
    const profile: ExtendedCustomerProfile = {
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      tinNumber: tinNumber.trim(),
      address: address.trim(),
      password,
      verificationToken,
    };
    pending.current = true; setBusy(true);
    try {
      const created = await signUp(profile);
      if (created) navigate("/login", { state: { phoneNumber: phoneNumber.trim(), returnTo } });
    } finally { pending.current = false; setBusy(false); }
  };

  if (step !== "details") return (
    <main className="auth-screen registration-phone-screen">
      <form className="auth-card registration-phone-card" onSubmit={verifyPhone}>
        <button type="button" className="registration-back" aria-label="Back" disabled={busy}
          onClick={() => { if (step === "otp") { setStep("phone"); setError(""); setOtp(""); } else navigate("/login", { state: { returnTo } }); }}>
          <ArrowLeft size={28} />
        </button>
        <div className="registration-brand">
          <BrandLogo size={116} />
          <p>Welcome to<br />RENGAS BORONG</p>
        </div>
        <h1>{step === "phone" ? "Register New Account" : "Verify Phone Number"}</h1>
        <p className="registration-description">{step === "phone"
          ? "To register a new account, we must first verify your phone number."
          : `Enter the verification code for ${phoneNumber}.`}</p>
        {step === "phone" ? <div className="registration-field">
          <span>Phone Number</span>
          <span className="registration-phone-input">
            <CountryCodePicker value={country} disabled={busy} onChange={setCountry} />
            <input aria-label="Phone Number" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="12 3456 789"
              value={localPhone} onChange={event => setLocalPhone(event.target.value)} disabled={busy} required />
          </span>
        </div> : <label className="registration-field">
          <span>Verification Code</span>
          <span className="registration-phone-input"><input aria-label="Verification Code" inputMode="numeric" autoComplete="one-time-code"
            placeholder="6-digit code" pattern="[0-9]{6}" maxLength={6} value={otp}
            onChange={event => setOtp(event.target.value.replace(/\D/g, ""))} disabled={busy} required /></span>
        </label>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {step === "otp" && deliveryMessage && <p role="status">{deliveryMessage}</p>}
        {step === "otp" && testOtp && <p role="status">Test code: <strong>{testOtp}</strong></p>}
        <button className="registration-verify" type="submit" disabled={busy}>{busy ? "Please wait…" : step === "phone" ? "Verify" : "Confirm Code"}</button>
        {step === "otp" && <button type="button" className="auth-link-button" disabled={busy} onClick={async () => {
          if (pending.current) return;
          pending.current = true; setBusy(true); setError("");
          try { await requestCode(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to resend code."); }
          finally { pending.current = false; setBusy(false); }
        }}>Resend code</button>}
        <p className="registration-signin">Already have an account? <Link to="/login" state={{ returnTo }}>Sign In</Link></p>
      </form>
    </main>
  );

  return (
    <main className="auth-screen signup-screen">
      <form className="auth-card auth-signup-card" onSubmit={submit}>
        <div className="signup-title-row">
          <Link
            className="signup-back"
            to="/login"
            state={{ returnTo }}
            aria-label="Back to sign in"
          >
            <ArrowLeft size={21} />
          </Link>
          <h1>Sign Up</h1>
        </div>
        <p className="signup-intro">Create your Renga Borong account</p>
        <AuthInput
          icon={<Building2 />}
          value={businessName}
          onChange={setBusinessName}
          placeholder="Business / Company / Shop Name"
          autoComplete="organization"
        />
        <AuthInput
          icon={<UserRound />}
          value={fullName}
          onChange={setFullName}
          placeholder="Full Name"
          autoComplete="name"
        />
       
        <AuthInput
          icon={<Phone />}
          value={whatsappNumber}
          onChange={setWhatsappNumber}
          placeholder="WhatsApp Number"
          type="tel"
          autoComplete="tel"
        />
        <AuthInput
          icon={<Phone />}
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="Phone Number"
          type="tel"
          autoComplete="tel"
          readOnly
        />
        <AuthInput
          icon={<Mail />}
          value={email}
          onChange={setEmail}
          placeholder="Email Address"
          type="email"
          autoComplete="email"
        />
        <AuthInput
          icon={<FileText />}
          value={tinNumber}
          onChange={setTinNumber}
          placeholder="TIN Number"
        />
        <label className="auth-input auth-textarea">
          <MapPin size={18} />
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Address"
            autoComplete="street-address"
            required
          />
        </label>

        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={setPassword}
          visible={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
          autoComplete="new-password"
        />
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((value) => !value)}
          autoComplete="new-password"
        />

        <label className="terms-row">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            required
          />
          <span>
            By creating an account, I confirm that I have read and agree to the{" "}
            <a
              href="https://rengas.my/tc.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a
              href="https://rengas.my/tc.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>.
          </span>
        </label>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={busy}>
          Sign Up
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login" state={{ returnTo }}>Sign In</Link>
        </p>
      </form>
    </main>
  );
}

type AuthInputProps = {
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  readOnly?: boolean;
};

function AuthInput({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  readOnly,
}: AuthInputProps) {
  return (
    <label className="auth-input">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        required
      />
    </label>
  );
}

type PasswordInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
};

type ExtendedCustomerProfile = Parameters<
  ReturnType<typeof useApp>["signUp"]
>[0] & {
  whatsappNumber: string;
  email: string;
  tinNumber: string;
  password: string;
};

function PasswordInput({
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: PasswordInputProps) {
  return (
    <label className="auth-input">
      <LockKeyhole size={18} />
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={8}
        required
      />
      <button
        className="password-toggle"
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </label>
  );
}

