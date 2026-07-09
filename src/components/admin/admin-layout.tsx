"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Palette, Settings, LogOut, Menu, X, ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  username: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({ admin: null, logout: () => {} });

export const useAdmin = () => useContext(AdminContext);

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/admin/dashboard" },
  {
    label: "Products",
    icon: <Package className="h-4 w-4" />,
    href: "/admin/products",
    children: [
      { label: "All Products", href: "/admin/products" },
      { label: "Categories", href: "/admin/categories" },
    ],
  },
  { label: "Orders", icon: <ShoppingCart className="h-4 w-4" />, href: "/admin/orders" },
  {
    label: "Content",
    icon: <FileText className="h-4 w-4" />,
    href: "/admin/pages",
    children: [
      { label: "Pages", href: "/admin/pages" },
      { label: "Banners", href: "/admin/banners" },
    ],
  },
  { label: "Appearance", icon: <Palette className="h-4 w-4" />, href: "/admin/appearance" },
  { label: "Settings", icon: <Settings className="h-4 w-4" />, href: "/admin/settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nox-admin");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          localStorage.removeItem("nox-admin");
        }
      }
    }
    return null;
  });

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login");
    }
  }, [admin, router]);

  const logout = () => {
    localStorage.removeItem("nox-admin");
    setAdmin(null);
    router.push("/admin/login");
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  if (!admin) return null;

  return (
    <AdminContext.Provider value={{ admin, logout }}>
      <div className="flex h-screen bg-neutral-50">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              NOX Admin
            </Link>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.includes(item.label);

              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(item.label);
                      } else {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasChildren && (
                      isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {hasChildren && isExpanded && item.children && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`block rounded-lg px-3 py-2 text-sm ${
                              isChildActive
                                ? "bg-neutral-100 font-medium text-neutral-900"
                                : "text-neutral-500 hover:text-neutral-900"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t p-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <span className="text-sm text-neutral-500">
              Welcome, <strong>{admin.username}</strong>
            </span>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
