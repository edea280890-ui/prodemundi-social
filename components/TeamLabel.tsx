import { getTeamFlagCode } from "@/lib/teamFlags";

type Props = {
  name: string;
  className?: string;
};

export default function TeamLabel({ name, className = "" }: Props) {
  const code = getTeamFlagCode(name);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {code && (
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt=""
          className="h-4 w-6 rounded-[2px] object-cover"
          loading="lazy"
        />
      )}
      <span>{name}</span>
    </span>
  );
}
