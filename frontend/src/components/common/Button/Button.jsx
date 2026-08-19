import "./Button.css";

/**
 * 공통 버튼 컴포넌트
 *
 * 사용 예시:
 *   <Button>기본 버튼</Button>
 *   <Button variant="secondary">보조 버튼</Button>
 *   <Button variant="outline" size="sm">작은 버튼</Button>
 *   <Button disabled>비활성 버튼</Button>
 *
 * props
 *  - variant: "primary" | "secondary" | "outline" | "text"  (기본값 primary)
 *  - size: "sm" | "md" | "lg"                                (기본값 md)
 *  - disabled: boolean
 *  - onClick: function
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  ...rest
}) {
  const className = `btn btn--${variant} btn--${size}`;

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
