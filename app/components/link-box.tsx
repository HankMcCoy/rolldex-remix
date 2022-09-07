import { Form, Link } from "remix";
import { classNames } from "~/util";
import { XBtn } from "./x-btn";

export const linkBoxFrameClasses =
  "transition-all duration-100 block border bg-gray-50 border-gray-300 hover:border-gray-400 hover:bg-white";

interface Props {
  title: React.ReactNode;
  desc?: string;
  href: string;
  deleteable?: boolean;
  asLink?: boolean;
}
export const LinkBox = ({
  title,
  desc,
  href,
  deleteable,
  asLink = true,
}: Props) => {
  const content = (
    <>
      <div
        className={classNames(
          "font-medium font-serif",
          desc ? "pb-1" : undefined
        )}
      >
        {title}
      </div>
      {desc ? <div>{desc}</div> : null}
    </>
  );
  const contentClass = "flex flex-col flex-1 justify-center";
  return (
    <div className={`${linkBoxFrameClasses} pl-4 pr-3 py-3 flex align-center`}>
      {asLink ? (
        <Link to={href} className={contentClass}>
          {content}
        </Link>
      ) : (
        <div className={contentClass}>{content}</div>
      )}
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
              if (
                !window.confirm(
                  `Are you sure you want to delete "${title}"? This is not reversable.`
                )
              ) {
                e.preventDefault();
              }
            }}
          />
        </Form>
      )}
    </div>
  );
};
