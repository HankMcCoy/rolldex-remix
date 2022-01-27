import { FunctionComponent, ReactNode } from "react";
import { BookOpenIcon, UserGroupIcon } from "@heroicons/react/outline";
import { classNames } from "~/util";
import { Link } from "remix";
import { useLocation } from "react-router-dom";

const navigation = [
  { name: "Campaigns", href: "/campaigns", icon: UserGroupIcon },
  { name: "Systems", href: "/systems", icon: BookOpenIcon },
];

const intersperse = <T extends unknown>(
  list: Array<T>,
  separator: (i: number) => T
) =>
  list.slice(1).reduce((a, item, i) => [...a, separator(i), item], [list[0]]);

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex flex-col flex-grow bg-gray-700 overflow-y-auto">
        <div className="h-24 flex items-center flex-shrink-0 px-4">
          <a href="/" className="leading-10 w-auto text-3xl text-white">
            Rolldex
          </a>
        </div>
        <div className="flex-1 flex flex-col">
          <nav className="flex-1 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  location.pathname.startsWith(item.href)
                    ? "bg-gray-800 text-white"
                    : "text-gray-100 hover:bg-gray-600",
                  "group flex items-center px-5 py-3 font-base"
                )}
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-gray-300"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

interface Breadcrumb {
  text: string;
  href: string;
}
interface PageHeaderProps {
  heading: string;
  breadcrumbs?: Array<Breadcrumb>;
  controls?: React.ReactNode;
}
export const PageHeader: FunctionComponent<PageHeaderProps> = ({
  breadcrumbs,
  heading,
  controls,
}) => {
  return (
    <div className="px-6 h-24 bg-violet-800 text-white flex justify-between items-center">
      <div className="flex flex-col justify-center space-y-1">
        <div className="flex flex-row space-x-1">
          {breadcrumbs && breadcrumbs.length
            ? intersperse(
                breadcrumbs.map((b) => (
                  <Link key={b.href} to={b.href}>
                    {b.text}
                  </Link>
                )),
                (i) => <span key={i}>&gt;</span>
              )
            : null}
        </div>
        <h1 className="text-4xl">{heading}</h1>
      </div>
      <div className="flex-initial flex space-x-2">{controls}</div>
    </div>
  );
};

export const Page: FunctionComponent = ({ children }) => {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-56 flex flex-col flex-1 min-h-full">{children}</div>
    </>
  );
};

export const Main: FunctionComponent = ({ children }) => {
  return (
    <main className="flex-1 px-6 py-4 flex flex-col space-y-2">{children}</main>
  );
};

type ContentProps = { sidePanel?: ReactNode } & PageHeaderProps;
export const Content: FunctionComponent<ContentProps> = ({
  heading,
  breadcrumbs,
  controls,
  sidePanel,
  children,
}) => {
  return (
    <>
      <PageHeader {...{ heading, breadcrumbs, controls }} />
      <div className="flex flex-1">
        <Main>{children}</Main>
        {sidePanel}
      </div>
    </>
  );
};
