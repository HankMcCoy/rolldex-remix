import { Link } from "remix";
import { classNames } from "~/util";

export const linkBoxFrameClasses =
  "transition-all duration-100 block border bg-gray-50 border-gray-300 hover:border-gray-400 hover:bg-white";

interface Props {
  title: string;
  desc?: string;
  href: string;
}
export const LinkBox = ({ title, desc, href }: Props) => {
  return (
    <Link to={href} className={`${linkBoxFrameClasses} px-4 py-3 flex-initial`}>
      <div className={classNames("font-normal", desc ? "pb-1" : undefined)}>
        {title}
      </div>
      {desc ? <div>{desc}</div> : null}
    </Link>
  );
};
