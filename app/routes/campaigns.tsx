import { User } from "@prisma/client";
import { LoaderFunction, Outlet, useCatch, useLoaderData } from "remix";
import { Page } from "~/components/layout";
import { requireUser } from "~/session.server";

export default function CampaignsLayout() {
  const { user } = useLoaderData<LoaderData>();
  return (
    <Page user={user}>
      <Outlet />
    </Page>
  );
}

type LoaderData = { user: User };
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return { user };
};

export const CatchBoundary = () => {
  const { user } = useLoaderData<LoaderData>();
  const caught = useCatch();

  return (
    <Page user={user}>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>{JSON.stringify(caught.data, null, 2)}</pre>
    </Page>
  );
};
