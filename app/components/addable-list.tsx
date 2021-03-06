import { Link } from "remix";
import { LinkButton } from "./layout";
import { linkBoxFrameClasses } from "./link-box";
import { TitledSection } from "./titled-section";

interface Props<T> {
  title: string;
  addHref: string;
  addTitle: string;
  entities: Array<T>;
  count: number;
  canAdd: boolean;
  seeAllHref?: string;
  getListItem: (e: T, i: number) => JSX.Element;
}
export const AddableList = <T extends unknown>({
  title,
  addHref,
  addTitle,
  entities,
  count,
  canAdd,
  seeAllHref,
  getListItem,
}: Props<T>) => {
  return (
    <TitledSection
      title={`${title} (${count})`}
      controls={
        canAdd ? (
          <LinkButton
            to={addHref}
            title={addTitle}
            style="lightSecondary"
            size="small"
          >
            +
          </LinkButton>
        ) : null
      }
    >
      <div className="flex flex-col space-y-2">
        {entities.map(getListItem)}
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
