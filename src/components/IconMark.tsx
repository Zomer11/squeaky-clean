type Props = {
  name: "phone" | "mail" | "map" | "clock";
  className?: string;
};

const PATHS = {
  phone:
    "M6.5 3.8c.4-.4 1-.5 1.5-.2l2.2 1.2c.5.3.7.8.6 1.4l-.4 2.1c-.1.4.1.8.4 1 1.2.8 2.5 1.8 3.5 3 .3.3.7.4 1.1.3l2.1-.5c.5-.1 1.1.1 1.4.6l1.3 2.1c.3.5.2 1.2-.2 1.6l-1.5 1.5c-.4.4-1 .6-1.6.5-2.4-.3-5.2-2-7.6-4.4S4.4 9.2 4.1 6.8c-.1-.6.1-1.2.5-1.6L6.5 3.8z",
  mail: "M3.5 6.2A1.7 1.7 0 0 1 5.2 4.5h9.6c.9 0 1.7.8 1.7 1.7v7.6c0 .9-.8 1.7-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7V6.2zm1.8.5 4.7 3.2 4.7-3.2M5.3 13.2l3.8-3.1m5.6 3.1-3.8-3.1",
  map: "M10 17s5.5-4.1 5.5-8.2A5.5 5.5 0 0 0 4.5 8.8C4.5 12.9 10 17 10 17zm0-6.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z",
  clock:
    "M10 17.2a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4zM10 6.2V10l2.6 1.6",
};

export function IconMark({ name, className = "h-5 w-5" }: Props) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
