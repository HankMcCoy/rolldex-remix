import { FunctionComponent } from "react";
import { Outlet, useCatch } from "remix";
import { Page } from "~/components/layout";

export default function CampaignsLayout() {
  return (
    <Page>
      <Outlet />
    </Page>
  );
}

export const CatchBoundary = () => {
  const caught = useCatch();

  return (
    <Page>
      <div>
        <h1>Caught</h1>
        <p>Status: {caught.status}</p>
        <pre>{JSON.stringify(caught.data, null, 2)}</pre>
      </div>
    </Page>
  );
};
