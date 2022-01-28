import { Link } from "remix";
import { Tooltip } from "./tooltip";

export interface RelatedThing {
  id: string;
  name: string;
  summary: string;
}
type RelatedThingsProps = {
  title: string;
  things: Array<RelatedThing>;
  getUrl: (thing: RelatedThing) => string;
};
export const RelatedThings = ({ title, things, getUrl }: RelatedThingsProps) =>
  things.length ? (
    <div className="px-5 my-3">
      <h2 className="text-lg font-serif mb-1">{title}</h2>
      <ul>
        {things.map((t) => (
          <Tooltip
            renderTarget={(ref) => (
              <li ref={ref}>
                <Link to={getUrl(t)}>- {t.name}</Link>
              </li>
            )}
            tooltipContent={t.summary}
          />
        ))}
      </ul>
    </div>
  ) : null;
