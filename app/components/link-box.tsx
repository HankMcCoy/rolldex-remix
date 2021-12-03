import { Link } from "remix";

interface Props {
  title: string;
  desc?: string;
  href: string;
}
export const LinkBox = ({ title, desc, href }: Props) => {
  return (
    <Link
      to={href}
      className="px-4 py-3 block flex-initial border border-gray-300 hover:border-gray-400 bg-white"
    >
      <div className="font-normal pb-1">{title}</div>
      {desc ? <div>{desc}</div> : null}
    </Link>
  );
};
