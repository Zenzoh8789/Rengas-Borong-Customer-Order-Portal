import { useState, type FormEvent } from "react";
import { ArrowLeft, ChevronRight, CircleHelp, LogOut, Phone, UserRound } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { CustomerProfile } from "../services/api";

// Add your real support number here later, including the country code.
const SUPPORT_PHONE = "";
const SUPPORT_HOURS = "";
const SUPPORT_TEL = SUPPORT_PHONE.replace(/[^+\d]/g, "");
type ProfileDetails = Omit<CustomerProfile, "id">;
type AccountPageProps = {
  // Connect to your authenticated backend update method when available.
  onSaveProfile?: (details: ProfileDetails) => Promise<void>;
};
const fields: { key: keyof ProfileDetails; label: string; type?: string; required?: boolean }[] = [
  { key: "fullName", label: "Full name", required: true },
  { key: "businessName", label: "Company / shop name", required: true },
  { key: "tinNumber", label: "TIN number", required: true },
  { key: "phoneNumber", label: "Phone number", type: "tel", required: true },
  { key: "whatsappNumber", label: "WhatsApp number", type: "tel", required: true },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Delivery address", required: true },
];

export function AccountPage({ onSaveProfile }: AccountPageProps = {}) {
  const { logout, profile, refreshProfile } = useApp();
  const [panel, setPanel] = useState<"menu" | "profile" | "help">("menu");
  const [draft, setDraft] = useState<ProfileDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const openProfile = () => {
    setMessage("");
    setDraft(profile ? {
      fullName: profile.fullName || "", businessName: profile.businessName || "",
      tinNumber: profile.tinNumber || "", phoneNumber: profile.phoneNumber || "",
      whatsappNumber: profile.whatsappNumber || "", email: profile.email || "",
      address: profile.address || "",
    } : null);
    setPanel("profile");
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || !onSaveProfile || saving) return;
    setSaving(true);
    setMessage("");
    try {
      await onSaveProfile(draft);
      await refreshProfile();
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Unable to confirm the profile update. Please reload your profile before trying again.");
    } finally { setSaving(false); }
  };

  return <div className="account-page account-redesign">
    {panel === "menu" ? <nav aria-label="Account menu" className="account-simple-menu">
      <button type="button" onClick={openProfile}><UserRound /><span>My Profile</span><ChevronRight /></button>
      <button type="button" onClick={() => setPanel("help")}><CircleHelp /><span>Help Center</span><ChevronRight /></button>
      <button type="button" className="account-signout" onClick={logout}><LogOut /><span>Logout</span></button>
    </nav> : <section className="account-panel">
      <button type="button" className="account-back" disabled={saving} onClick={() => { setPanel("menu"); setMessage(""); }}><ArrowLeft /> Back</button>
      <h1>{panel === "profile" ? "My Profile" : "Help Center"}</h1>
      {panel === "profile" ? draft ? <form onSubmit={save}>
        <fieldset disabled={saving}>
          {fields.map(field => <label key={field.key}>
            <span>{field.label}{field.required ? " *" : ""}</span>
            {field.key === "address" ? <textarea required rows={3} value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} /> :
              <input type={field.type || "text"} required={field.required} value={draft[field.key]} onChange={e => setDraft({ ...draft, [field.key]: e.target.value })} />}
          </label>)}
          {!onSaveProfile && <p className="account-note">Editing preview only. Saving must be connected to your profile-update API; these changes are not saved.</p>}
          <button type="submit" className="account-save" disabled={!onSaveProfile || saving}>{saving ? "Saving..." : "Save changes"}</button>
        </fieldset>
        {message && <p role="status">{message}</p>}
      </form> : <p>Your profile is unavailable. Please sign in again.</p> : <div className="account-help">
        <p>For help with an order, delivery, or account details, contact our support team. Keep your order number ready.</p>
        {SUPPORT_PHONE ? <a className="account-phone" href={`tel:${SUPPORT_TEL}`}><Phone />{SUPPORT_PHONE}</a> : <p className="account-note">Support phone number will be added soon.</p>}
        {SUPPORT_HOURS && <p>Support hours: {SUPPORT_HOURS}</p>}
      </div>}
    </section>}
  </div>;
}


