import {
  FunctionComponent,
  Reducer,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import ReactModal from "react-modal";
import { useDebounce } from "use-debounce";
import { useFetch } from "~/util/use-fetch";

type Match = {
  name: string;
  href: string;
};
type QuickFindState = {
  q: string;
  matches: Array<Match>;
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
      payload: Array<Match>;
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
const quickFindReducer: Reducer<QuickFindState, QuickFindAction> = (
  state: QuickFindState,
  action: QuickFindAction
) => {
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
      const q = action.payload;
      return {
        ...state,
        q,
        matches: q === "" ? [] : state.matches,
      };
    case "MATCHES_LOADED":
      const matches = action.payload;
      return {
        ...state,
        matches,
        selectedIdx: 0,
      };
    default:
      return state;
  }
};

type QuickFindData = {
  matches: Array<Match>;
};

type QuickFindModalProps = {
  isShown: boolean;
  isAdmin: boolean;
  toggleShown: (isShown: boolean) => void;
  campaignId: string;
};
export const QuickFindModal: FunctionComponent<QuickFindModalProps> = ({
  isShown,
  isAdmin,
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
    if (latestQuickFindData !== undefined) {
      dispatch({
        type: "MATCHES_LOADED",
        payload: isAdmin
          ? latestQuickFindData.matches.concat({
              name: `Add '${state.q}'`,
              href: `/campaigns/${campaignId}/nouns/add?name=${state.q}`,
            })
          : latestQuickFindData.matches,
      });
    }
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
        ? state.matches.map((m, i) => (
            <a
              key={i}
              className={`px-6 py-3 ${
                state.selectedIdx === i
                  ? "bg-violet-800 text-white"
                  : "bg-white"
              }`}
              ref={i === state.selectedIdx ? selectedRef : null}
              href={m.href}
            >
              {m.name}
            </a>
          ))
        : null}
    </ReactModal>
  );
};
