import { Outlet } from "remix";
import { Page } from "~/components/layout";

export default function CampaignsLayout() {
  return (
    <Page>
      <Outlet />
    </Page>
  );
}
