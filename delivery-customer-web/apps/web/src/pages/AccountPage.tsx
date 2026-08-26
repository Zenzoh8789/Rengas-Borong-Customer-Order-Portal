import { Bell, ChevronRight, CircleHelp, LogOut, MapPin, UserRound } from "lucide-react";
import { useApp } from "../context/AppContext";

export function AccountPage() {
  const { logout, profile } = useApp();
  return <div className="account-page">
    <section className="profile-card"><span>{profile?.businessName?.slice(0, 2).toUpperCase() || "RB"}</span><div><h2>{profile?.businessName || "Rengas Customer"}</h2><p>{profile?.fullName || "Wholesale buyer account"}</p><small>{profile?.address}</small></div></section>
    <section className="account-menu">
      <button><UserRound /><span><b>My profile</b><small>Personal and company details</small></span><ChevronRight /></button>
      <button><MapPin /><span><b>Delivery addresses</b><small>Manage saved locations</small></span><ChevronRight /></button>
      <button><Bell /><span><b>Notifications</b><small>Order and offer alerts</small></span><ChevronRight /></button>
      <button><CircleHelp /><span><b>Help centre</b><small>Get support from our team</small></span><ChevronRight /></button>
    </section>
    <button className="account-logout" onClick={logout}><LogOut /> Sign out</button>
  </div>;
}
