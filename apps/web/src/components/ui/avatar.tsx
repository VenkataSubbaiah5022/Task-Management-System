import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, imageUrl, className }: AvatarProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn("h-7 w-7 rounded-full object-cover ring-1 ring-white/10", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 text-[10px] font-semibold text-emerald-100 ring-1 ring-white/10",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
