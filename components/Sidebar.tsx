'use client'

import Link from "next/link"
import Image from "next/image"
import {
  Bot,
  Brain,
  FlaskConical,
  Rocket,
  ChevronLeft,
  Key  // 👈 AJOUT de l'icône Key
} from "lucide-react"
import clsx from "clsx"
import { useSidebar } from "@/context/SidebarContext"
import { motion, AnimatePresence } from "framer-motion"
import SidebarUserDropdown from "@/components/SidebarUserDropdown"

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebar()

  const navItems = [
    { href: "/agents", label: "My Agents", icon: <Bot size={20} /> },
    { href: "/agent-lab", label: "Improve Agent", icon: <Brain size={20} /> },
    { href: "/demo-agent", label: "Demo Agent", icon: <FlaskConical size={20} /> },
    { href: "/launch-agent", label: "Launch Agent", icon: <Rocket size={20} /> },
    { href: "/api-key", label: "API Key", icon: <Key size={20} /> }, // 👈 AJOUT
  ]

  const fadeLabel = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.25, ease: "easeInOut" }
  }

  return (
    <aside
      className={clsx(
        "fixed top-4 bottom-4 left-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl text-white z-50 transition-all duration-500 ease-in-out",
        "border border-gray-600 shadow-2xl", // Style premium avec dégradé
        collapsed ? "w-[85px]" : "w-[270px]",
        "hidden md:block"
      )}
    >
      {/* Header */}
      <div className={clsx("relative flex items-center px-5", collapsed ? "pt-5 pb-5" : "pt-6 pb-6")}>
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full shrink-0 w-10 h-10"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="brand"
                {...fadeLabel}
                className="ml text-lg font-semibold overflow-hidden whitespace-nowrap"
              >
                TestYour<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span> Now
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse button - Style premium */}
        <button
          onClick={toggleSidebar}
          className={clsx(
            "absolute right-5 h-9 w-9 flex items-center justify-center bg-white text-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105",
            collapsed && "translate-y-[65px]"
          )}
        >
          <ChevronLeft
            size={20}
            className={clsx("transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={clsx(
          "flex flex-col gap-2 px-3 transition-transform duration-500",
          collapsed ? "translate-y-[65px]" : "translate-y-0"
        )}
      >
        {navItems.map(({ href, label, icon }) => (
          <div className="relative group" key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 hover:bg-blue-600 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="shrink-0 text-blue-400 group-hover:text-white transition-colors duration-300">
                {icon}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    key={label}
                    {...fadeLabel}
                    className="overflow-hidden whitespace-nowrap text-gray-300 group-hover:text-white transition-colors duration-300"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            {collapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 text-white text-xs px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                {label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Footer avatar dropdown */}
      <div className="absolute bottom-4 w-full px-3">
        <SidebarUserDropdown collapsed={collapsed} />
      </div>
    </aside>
  )
}