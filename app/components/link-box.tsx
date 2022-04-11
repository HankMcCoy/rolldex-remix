import { Form, Link } from "remix";
import { classNames } from "~/util";
import { XBtn } from "./x-btn";

export const linkBoxFrameClasses =
  "transition-all duration-100 block border bg-gray-50 border-gray-300 hover:border-gray-400 hover:bg-white";

interface Props {
  title: string;
  desc?: string;
  href: string;
  deleteable?: boolean;
}
export const LinkBox = ({ title, desc, href, deleteable }: Props) => {
  return (
    <div className={`${linkBoxFrameClasses} pl-4 pr-3 py-3 flex align-center`}>
      <Link to={href} className="flex-1">
        <div
          className={classNames(
            "font-medium font-serif",
            desc ? "pb-1" : undefined
          )}
        >
          {title}
        </div>
        {desc ? <div>{desc}</div> : null}
      </Link>
      {deleteable && (
        <Form
          method="delete"
          action={href}
          onClick={(e) => e.stopPropagation()}
          className="flex-initial flex items-center justify-center"
        >
          <XBtn
            type="submit"
            onClick={(e) => {
              if (!window.confirm("YES?")) e.preventDefault();
            }}
          />
        </Form>
      )}
    </div>
  );
};
