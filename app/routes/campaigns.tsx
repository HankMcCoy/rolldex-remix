import { User } from "@prisma/client";
import { LoaderFunction, Outlet, useCatch, useLoaderData } from "remix";
import { Page, Content } from "~/components/layout";
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
  const caught = useCatch();

  return (
    <Page>
      <Content heading="Error">
        <p>Status: {caught.status}</p>
        <pre>{JSON.stringify(caught.data, null, 2)}</pre>
      </Content>
    </Page>
  );
};
