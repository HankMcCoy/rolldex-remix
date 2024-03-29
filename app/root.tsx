import { StrictMode } from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import type { LinksFunction } from "remix";

import tailwindUrl from "./tailwind.css";
import easyMdeStyles from "easymde/dist/easymde.min.css";
import styles from "./styles/app.css";
import { useMountHotkeyListener } from "./util/keyboard-shortcuts";
import ReactModal from "react-modal";

ReactModal.setAppElement("#main");

// https://remix.run/api/app#links
export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindUrl },
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: easyMdeStyles },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css?family=Roboto+Slab:300,400",
    },
  ];
};

// https://remix.run/api/conventions#default-export
// https://remix.run/api/conventions#route-filenames
export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

// https://remix.run/docs/en/v1/api/conventions#errorboundary
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <div>
        <h1>There was an error</h1>
        <p>{error.message}</p>
        <hr />
        <p>
          Hey, developer, you should replace this with what you want your users
          to see.
        </p>
      </div>
    </Document>
  );
}

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <h1>
        {caught.status}: {caught.statusText}
      </h1>
      {message}
    </Document>
  );
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  useMountHotkeyListener();
  return (
    <StrictMode>
      <html lang="en" className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
        </head>
        <body className="text-gray-800 h-full">
          <div id="main" className="h-full">
            {children}
          </div>
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === "development" && <LiveReload />}
        </body>
      </html>
    </StrictMode>
  );
}
