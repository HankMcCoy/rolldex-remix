import { useState } from "react";
import { Outlet } from "remix";
import ReactModal from "react-modal";
import { useHotkey } from "~/util/keyboard-shortcuts";

export default function CampaignLayout() {
  const [isQuickSwitchShown, showQuickSwitch] = useState(false);
  useHotkey("mod+k", () => {
    showQuickSwitch(true);
  });
  return (
    <>
      <Outlet />
      <ReactModal
        isOpen={isQuickSwitchShown}
        onRequestClose={() => showQuickSwitch(false)}
        className="absolute top-1/4 "
        overlayClassName="fixed bg-gray-900 bg-opacity-30 inset-0 flex align-middle justify-center"
      >
        <input autoFocus className="p-3" />
      </ReactModal>
    </>
  );
}
