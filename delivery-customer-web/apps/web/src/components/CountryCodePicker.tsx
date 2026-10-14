import { useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import * as Flags from "country-flag-icons/react/3x2";
import { phoneCountryNames } from "../utils/phoneCountryNames";

const countries = getCountries().map(country => ({
  country, name: phoneCountryNames[country] ?? country, code: getCountryCallingCode(country),
})).sort((a, b) => a.name.localeCompare(b.name));

function CountryFlag({ country }: { country: CountryCode }) {
  const Flag = Flags[country as keyof typeof Flags];
  return <Flag className="country-flag" aria-hidden="true" />;
}

export function CountryCodePicker({ value, onChange, disabled }: {
  value: CountryCode; onChange: (country: CountryCode) => void; disabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState("");
  const selected = countries.find(item => item.country === value)!;
  const query = search.trim().toLowerCase().replace(/^\+/, "");
  const results = countries.filter(item => !query || item.name.toLowerCase().includes(query)
    || item.country.toLowerCase().includes(query) || item.code.startsWith(query));
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };

  return <>
    <button ref={trigger} type="button" className="country-code-trigger" disabled={disabled}
      aria-label={`Country calling code: ${selected.name} (+${selected.code})`} aria-haspopup="dialog"
      onClick={() => { setSearch(""); dialog.current?.showModal(); }}>
      <CountryFlag country={value} /><span>+{selected.code}</span><ChevronDown size={15} aria-hidden="true" />
    </button>
    <dialog ref={dialog} className="country-picker-dialog" aria-labelledby="country-picker-title"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === dialog.current) {
        const rect = dialog.current.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      } }}>
      <div className="country-picker-heading"><span id="country-picker-title">Select country</span>
        <button type="button" className="icon-btn" aria-label="Close country picker" onClick={close}><X size={20} /></button>
      </div>
      <div className="country-picker-search"><Search size={18} aria-hidden="true" />
        <input autoFocus aria-label="Search country or calling code" placeholder="Search country or code" value={search}
          onChange={event => setSearch(event.target.value)} />
      </div>
      <div className="country-picker-options">
        {results.map(item => <button key={item.country} type="button" className="country-picker-option"
          aria-pressed={item.country === value} onClick={() => { onChange(item.country); close(); }}>
          <CountryFlag country={item.country} /><span>{item.name}</span><span className="country-calling-code">+{item.code}</span>
        </button>)}
        {!results.length && <p className="country-picker-empty">No countries found.</p>}
      </div>
    </dialog>
  </>;
}
