export type NavItem = {
  label: string;
  href: string;
  icon: string;
  match: (pathname: string) => boolean;
};

export const CUSTOMER_TOP_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    match: (p) => p === "/dashboard",
  },
  {
    label: "Book",
    href: "/book/type",
    icon: "add_box",
    match: (p) => p.startsWith("/book"),
  },
  {
    label: "Orders",
    href: "/orders",
    icon: "local_shipping",
    match: (p) => p.startsWith("/orders"),
  },
  {
    label: "Account",
    href: "/account/settings",
    icon: "person",
    match: (p) => p.startsWith("/account"),
  },
  {
    label: "Help",
    href: "/help/customer",
    icon: "help",
    match: (p) => p.startsWith("/help/customer"),
  },
];

export const CUSTOMER_SIDEBAR_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    match: (p) => p === "/dashboard",
  },
  {
    label: "Orders",
    href: "/orders",
    icon: "local_shipping",
    match: (p) => p.startsWith("/orders"),
  },
  {
    label: "Impact",
    href: "/impact",
    icon: "eco",
    match: (p) => p.startsWith("/impact"),
  },
  {
    label: "Account",
    href: "/account/settings",
    icon: "person",
    match: (p) => p.startsWith("/account"),
  },
  {
    label: "Help",
    href: "/help/customer",
    icon: "help",
    match: (p) => p.startsWith("/help/customer"),
  },
];

export const ADMIN_SIDEBAR_NAV: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: "dashboard",
    match: (p) => p === "/admin",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "local_shipping",
    match: (p) => p.startsWith("/admin/orders"),
  },
  {
    label: "Drivers",
    href: "/admin/drivers",
    icon: "directions_car",
    match: (p) => p.startsWith("/admin/drivers"),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: "group",
    match: (p) => p.startsWith("/admin/customers"),
  },
  {
    label: "Verifications",
    href: "/admin/verifications",
    icon: "verified_user",
    match: (p) => p.startsWith("/admin/verifications"),
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    icon: "payments",
    match: (p) => p.startsWith("/admin/pricing"),
  },
  {
    label: "Activity",
    href: "/admin/activity",
    icon: "monitoring",
    match: (p) => p.startsWith("/admin/activity"),
  },
  {
    label: "System",
    href: "/admin/system",
    icon: "dns",
    match: (p) => p.startsWith("/admin/system"),
  },
];

export const CUSTOMER_MOBILE_NAV: NavItem[] = [
  {
    label: "Dash",
    href: "/dashboard",
    icon: "dashboard",
    match: (p) => p === "/dashboard",
  },
  {
    label: "Orders",
    href: "/orders",
    icon: "local_shipping",
    match: (p) => p.startsWith("/orders"),
  },
  {
    label: "Impact",
    href: "/impact",
    icon: "eco",
    match: (p) => p.startsWith("/impact"),
  },
  {
    label: "Account",
    href: "/account/settings",
    icon: "person",
    match: (p) => p.startsWith("/account"),
  },
];
