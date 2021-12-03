import type { LoaderFunction } from "remix";
import { redirect } from "remix";

export let loader: LoaderFunction = (args) => {
  return redirect("/campaigns");
};
