import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const navbarVariants = cva(
  "flex items-center justify-between w-full px-4 py-3",
  {
    variants: {
      variant: {
        default: "bg-background border-b border-border",
        filled: "bg-primary text-primary-foreground",
        transparent: "bg-transparent",
        teal: "bg-teal-600 text-white",
        "teal-light": "bg-teal-50 border-b border-teal-200",
      },
      size: {
        default: "h-16",
        sm: "h-12",
        lg: "h-20",
        xl: "h-24",
      },
      sticky: {
        true: "sticky top-0 z-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      sticky: false,
    },
  }
)

export interface NavbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navbarVariants> {
  logo?: React.ReactNode
  links?: Array<{
    label: string
    href: string
    active?: boolean
  }>
  actions?: React.ReactNode
}

const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ className, variant, size, sticky, logo, links, actions, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(navbarVariants({ variant, size, sticky, className }))}
      {...props}
    >
      <div className="flex items-center space-x-8">
        {logo && (
          <div className="flex-shrink-0">
            {logo}
          </div>
        )}
        
        {links && links.length > 0 && (
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  link.active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      )}
    </nav>
  )
)
Navbar.displayName = "Navbar"

const NavbarBrand = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-2 font-bold text-lg", className)}
    {...props}
  >
    {children}
  </div>
))
NavbarBrand.displayName = "NavbarBrand"

const NavbarLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean
  }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "text-sm font-medium transition-colors hover:text-primary",
      active
        ? "text-primary font-semibold"
        : "text-muted-foreground",
      className
    )}
    {...props}
  />
))
NavbarLink.displayName = "NavbarLink"

export { Navbar, NavbarBrand, NavbarLink, navbarVariants }