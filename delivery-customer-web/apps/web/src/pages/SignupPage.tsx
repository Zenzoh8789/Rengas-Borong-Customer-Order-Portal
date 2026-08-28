import { useState, type FormEvent, type ReactNode } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function SignupPage() {
  const { signUp } = useApp();
  const navigate = useNavigate();
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    };
    const created = await signUp(profile);
    if (created)
      navigate("/login", { state: { phoneNumber: phoneNumber.trim() } });
  };

  return (
    <main className="auth-screen signup-screen">
      <form className="auth-card auth-signup-card" onSubmit={submit}>
        <div className="signup-title-row">
          <Link
            className="signup-back"
            to="/login"
            aria-label="Back to sign in"
          >
            <ArrowLeft size={21} />
          </Link>
          <h1>Sign Up</h1>
        </div>
        <p className="signup-intro">Create your Renga Borong account</p>

        <AuthInput
          icon={<UserRound />}
          value={fullName}
          onChange={setFullName}
          placeholder="Full Name"
          autoComplete="name"
        />
        <AuthInput
          icon={<Building2 />}
          value={businessName}
          onChange={setBusinessName}
          placeholder="Business / Shop Name"
          autoComplete="organization"
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
  <Link to="/terms">Terms and Conditions</Link> and{" "}
  <Link to="/privacy">Privacy Policy</Link>.
</span>
        </label>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit">
          Sign Up
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
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
};

function AuthInput({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
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
