import { Link } from "remix";

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
          <li className="">
            <Link to={getUrl(t)}>- {t.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
