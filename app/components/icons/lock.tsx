import * as React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: 24 | 32;
}
const Lock = ({ size = 32, ...otherProps }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    {...otherProps}
  >
    <title>{"Lock"}</title>
    <path
      d="M16 21.915v2.594a.5.5 0 0 0 1 0v-2.594a1.5 1.5 0 1 0-1 0ZM9 14v-3.5a7.5 7.5 0 1 1 15 0V14c1.66.005 3 1.35 3 3.01v9.98A3.002 3.002 0 0 1 23.991 30H9.01A3.008 3.008 0 0 1 6 26.99v-9.98A3.002 3.002 0 0 1 9 14Zm3 0v-3.5C12 8.01 14.015 6 16.5 6c2.48 0 4.5 2.015 4.5 4.5V14h-9Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export default Lock;
