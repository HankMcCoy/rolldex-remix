import { FunctionComponent, useEffect, useState } from "react";
import { LoaderFunction, Outlet, useLoaderData } from "remix";
import ReactModal from "react-modal";
import { useHotkey } from "~/util/keyboard-shortcuts";
import { useDebounce } from "use-debounce";
import useSWR from "swr";
import { Noun } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type QuickFindData = {
  nouns: Array<Noun>;
};

type QuickFindModalProps = {
  isShown: boolean;
  toggleShown: (isShown: boolean) => void;
  campaignId: string;
};
const QuickFindModal: FunctionComponent<QuickFindModalProps> = ({
  isShown,
  toggleShown,
  campaignId,
}) => {
  const [search, setSearch] = useState("");
  const [q] = useDebounce(search, 100);
  const { data: quickFindData } = useSWR<QuickFindData>(
    q ? `/campaigns/${campaignId}/quick-find?q=${q}` : null,
    fetcher
  );

  return (
    <ReactModal
      isOpen={isShown}
      onRequestClose={() => toggleShown(false)}
      className="absolute top-1/4 flex flex-col w-full max-w-[500px]"
      overlayClassName="fixed bg-gray-900 bg-opacity-30 inset-0 flex align-middle justify-center"
    >
      <input
        autoFocus
        className="px-6 py-4 outline-none rounded-none"
        placeholder="Jump to..."
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {quickFindData
        ? quickFindData.nouns.map((n) => (
            <a
              key={n.id}
              className="px-6 py-3 bg-white"
              href={`/campaigns/${campaignId}/nouns/${n.id}`}
            >
              {n.name}
            </a>
          ))
        : null}
    </ReactModal>
  );
};

export default function CampaignLayout() {
  const { campaignId } = useLoaderData<LoaderData>();
  const [isQuickSwitchShown, showQuickSwitch] = useState(false);
  useHotkey("mod+k", () => {
    showQuickSwitch(true);
  });
  return (
    <>
      <Outlet />
      <QuickFindModal
        campaignId={campaignId}
        isShown={isQuickSwitchShown}
        toggleShown={showQuickSwitch}
      />
    </>
  );
}

type LoaderData = {
  campaignId: string;
};
export let loader: LoaderFunction = ({ params }) => {
  const { campaignId } = params;
  if (!campaignId) throw new Error("Campaign ID missing");

  return { campaignId };
};
