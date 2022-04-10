import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { LoaderFunction, Outlet, useLoaderData } from "remix";
import ReactModal from "react-modal";
import { useHotkey } from "~/util/keyboard-shortcuts";
import { useDebounce } from "use-debounce";
import { useFetch } from "~/util/use-fetch";
import { Noun } from "@prisma/client";

type QuickFindState = {
  q: string;
  matches: Array<Noun>;
  selectedIdx: number;
};
type QuickFindAction =
  | {
      type: "ARROW_UP";
    }
  | {
      type: "ARROW_DOWN";
    }
  | {
      type: "QUERY_CHANGE";
      payload: string;
    }
  | {
      type: "MATCHES_LOADED";
      payload: Array<Noun>;
    };
const initialState: QuickFindState = {
  q: "",
  matches: [],
  selectedIdx: 0,
};
const wrapSelected = (val: number, count: number) => {
  if (count === 0) return 0;
  if (val === count) return 0;
  if (val === -1) return count - 1;
  return val;
};
function quickFindReducer(state: QuickFindState, action: QuickFindAction) {
  switch (action.type) {
    case "ARROW_DOWN":
      return {
        ...state,
        selectedIdx: wrapSelected(state.selectedIdx + 1, state.matches.length),
      };
    case "ARROW_UP":
      return {
        ...state,
        selectedIdx: wrapSelected(state.selectedIdx - 1, state.matches.length),
      };
    case "QUERY_CHANGE":
      return { ...state, q: action.payload };
    case "MATCHES_LOADED":
      return {
        ...state,
        matches: action.payload,
      };
    default:
      return state;
  }
}

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
  const selectedRef = useRef<HTMLAnchorElement>(null);
  const [state, dispatch] = useReducer(quickFindReducer, initialState);
  const [debouncedQ] = useDebounce(state.q, 100);

  // Keep track of the latest matching set of nouns we have
  const { data: latestQuickFindData } = useFetch<QuickFindData>(
    debouncedQ ? `/campaigns/${campaignId}/quick-find?q=${debouncedQ}` : null
  );
  useEffect(() => {
    if (latestQuickFindData !== undefined)
      dispatch({ type: "MATCHES_LOADED", payload: latestQuickFindData.nouns });
  }, [latestQuickFindData]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        dispatch({ type: "ARROW_DOWN" });
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        dispatch({ type: "ARROW_UP" });
        e.preventDefault();
      } else if (e.key === "Enter") {
        const linkEl = selectedRef.current;
        if (linkEl) {
          if (e.ctrlKey || e.metaKey) {
            window.open(linkEl.getAttribute("href") || undefined, "_blank");
          } else {
            linkEl.click();
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });

  return (
    <ReactModal
      isOpen={isShown}
      onRequestClose={() => toggleShown(false)}
      className="absolute top-1/4 flex flex-col w-full max-w-[500px]"
      overlayClassName="fixed bg-gray-900 bg-opacity-30 inset-0 flex align-middle justify-center"
    >
      <input
        autoFocus
        className="px-6 py-4 outline-none rounded-none border-b border-gray-300"
        placeholder="Jump to..."
        onChange={(e) => {
          dispatch({ type: "QUERY_CHANGE", payload: e.target.value });
        }}
      />
      {state.matches
        ? state.matches.map((n, i) => (
            <a
              key={n.id}
              className={`px-6 py-3 ${
                i === state.selectedIdx
                  ? "bg-violet-800 text-white"
                  : "bg-white"
              }`}
              ref={i === state.selectedIdx ? selectedRef : null}
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
