type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PremiumCard({
  children,
  className = "",
}: PremiumCardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-[#d4af37]/15
        bg-black/40
        shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        backdrop-blur-2xl
        transition
        duration-300
        hover:border-[#d4af37]/30
        ${className}
      `}
    >
      {children}
    </div>
  );
}