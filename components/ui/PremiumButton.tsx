type PremiumButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

export default function PremiumButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: PremiumButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-2xl
        border
        border-[#d4af37]/35
        bg-[#2b0008]/80
        px-5
        py-3
        font-[family-name:var(--font-montserrat)]
        text-xs
        font-bold
        uppercase
        tracking-[0.16em]
        text-[#ffd978]
        transition
        hover:border-[#d4af37]/55
        hover:bg-[#3a0010]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}