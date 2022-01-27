import React, { MutableRefObject } from "react";
import TetherComponent from "react-tether";

import { useHoverCombo } from "~/util";

export const Tooltip = ({
  attachment,
  targetAttachment,
  offset,
  renderTarget,
  tooltipContent,
}: {
  attachment?: string;
  targetAttachment?: string;
  offset?: string;
  renderTarget: (cb: (el: HTMLElement | null) => void) => React.ReactNode;
  tooltipContent: React.ReactNode;
}) => {
  const [targetRef, tooltipRef, showTooltip] = useHoverCombo();

  return (
    <TetherComponent
      attachment={attachment || "middle right"}
      targetAttachment={targetAttachment || "middle left"}
      offset={offset || "0 14px"}
      renderTarget={(ref) => {
        return renderTarget((el) => {
          targetRef.current = (
            ref as MutableRefObject<HTMLElement | null>
          ).current = el;
        });
      }}
      renderElement={(ref) =>
        showTooltip && (
          <div
            className="p-5 rounded-sm max-w-sm bg-gray-800 text-white"
            ref={(el) => {
              tooltipRef.current = (
                ref as MutableRefObject<HTMLDivElement | null>
              ).current = el;
            }}
          >
            {tooltipContent}
          </div>
        )
      }
    />
  );
};
