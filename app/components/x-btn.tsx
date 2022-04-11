function XSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current text-gray-300 group-hover:text-gray-500"
      style={{
        width: "14px",
        height: "14px",
      }}
    >
      <path d="M2 2L8 8M8 8L14 2M8 8L14 14M8 8L2 14" strokeWidth="3" />
    </svg>
  );
}

const DEFAULT_SIZE = 34;

type Props = {
  size?: number;
};
export function XBtn({
  size = DEFAULT_SIZE,
  ...rest
}: Props &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) {
  return (
    <button
      {...rest}
      className="group bg-none border-none flex items-center justify-center cursor-pointer focus:ring-1"
      style={{ width: `${size}px`, height: `${size}px`, flex: `0 0 ${size}px` }}
    >
      <XSvg />
    </button>
  );
}
