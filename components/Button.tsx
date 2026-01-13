import { ButtonHTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

interface ButtonAsButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never
}

interface ButtonAsLinkProps extends BaseButtonProps {
  href: string
  children: React.ReactNode
  className?: string
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }, ref) => {
    // Base styles that apply to all buttons
    const baseStyles = 'font-bold transition-colors disabled:cursor-not-allowed disabled:bg-gray-light disabled:border-gray-light'

    // Variant styles
    const variantStyles = {
      primary: 'bg-background text-teal border-2 border-teal hover:bg-teal hover:text-background',
      secondary: 'bg-background text-foreground border-2 border-foreground hover:bg-gray-light',
      danger: 'bg-background text-foreground border-2 border-yellow-border hover:bg-gray-light',
    }

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    }

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : ''

    // Combine all styles
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`.trim()

    // If href is provided, render as Link
    if ('href' in props && props.href) {
      return (
        <Link
          href={props.href}
          className={`${combinedClassName} inline-block text-center no-underline`}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {props.children}
        </Link>
      )
    }

    // Otherwise render as button
    const { children, ...buttonProps } = props as ButtonAsButtonProps
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        {...buttonProps}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
