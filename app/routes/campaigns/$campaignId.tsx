import { useState } from "react";
import { LoaderFunction, Outlet, useLoaderData } from "remix";
import { useHotkey } from "~/util/keyboard-shortcuts";
import { QuickFindModal } from "~/components/quick-find-modal";
import { getParams } from "~/util";
import { requireUserId } from "~/session.server";
import { getCampaignAccessLevel } from "~/queries/campaigns.server";

export default function CampaignLayout() {
  const { campaignId, accessLevel } = useLoaderData<LoaderData>();
  const [isQuickSwitchShown, showQuickSwitch] = useState(false);
  useHotkey("mod+k", () => {
    showQuickSwitch(true);
  });
  return (
    <>
      <Outlet />
      <QuickFindModal
        campaignId={campaignId}
        isAdmin={accessLevel === "ADMIN"}
        isShown={isQuickSwitchShown}
        toggleShown={showQuickSwitch}
      />
    </>
  );
}

type LoaderData = {
  campaignId: string;
  accessLevel: string;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { campaignId } = getParams(params, ["campaignId"] as const);
  const userId = await requireUserId(request);
  const accessLevel = await getCampaignAccessLevel({ campaignId, userId });

  return { campaignId, accessLevel };
};
