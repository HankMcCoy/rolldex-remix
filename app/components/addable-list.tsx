import { Link } from "remix";
import { TitledSection } from "./titled-section";

interface Props<T> {
  title: string;
  seeAllHref: string;
  entities: Array<T>;
  getListItem: (e: T) => JSX.Element;
}
export const AddableList = <T extends unknown>({
  title,
  seeAllHref,
  entities,
  getListItem,
}: Props<T>) => {
  return (
    <TitledSection title={`${title} (${entities.length})`}>
      <div className="flex flex-col space-y-2">
        {entities.slice(0, 3).map(getListItem)}
        <Link
          to={seeAllHref}
          className="hover:bg-white hover:text-gray-800 hover:border-gray-500 bg-gray-50 text-gray-500 border border-gray-300 py-1 text-center"
        >
          See all
        </Link>
      </div>
    </TitledSection>
  );
};
