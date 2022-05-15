import { LoaderFunction } from "remix";
import { logout } from "~/session.server";

export const loader: LoaderFunction = ({ request }) => {
  return logout(request);
};
