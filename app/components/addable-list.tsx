import { Link } from "remix";
import { LinkButton } from "./layout";
import { linkBoxFrameClasses } from "./link-box";
import { TitledSection } from "./titled-section";

interface Props<T> {
  title: string;
  addHref: string;
  addTitle: string;
  entities: Array<T>;
  seeAllHref?: string;
  getListItem: (e: T, i: number) => JSX.Element;
}
export const AddableList = <T extends unknown>({
  title,
  addHref,
  addTitle,
  entities,
  seeAllHref,
  getListItem,
}: Props<T>) => {
  return (
    <TitledSection
      title={`${title} (${entities.length})`}
      controls={
        <LinkButton
          to={addHref}
          title={addTitle}
          style="lightSecondary"
          size="small"
        >
          +
        </LinkButton>
      }
    >
      <div className="flex flex-col space-y-2">
        {entities.slice(0, 3).map(getListItem)}
        {seeAllHref ? (
          <Link
            to={seeAllHref}
            className={`${linkBoxFrameClasses} py-1 text-center`}
          >
            See all
          </Link>
        ) : null}
      </div>
    </TitledSection>
  );
};
