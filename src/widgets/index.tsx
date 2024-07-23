import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@jetbrains/ring-ui-built/components/style.css";
import App from "./App";
import { Host } from "./types";
import { DraggedIssueProvider } from "./DraggedIssueProvider";

declare var YTApp: {
    register: () => Promise<Host>
};

export const host = await YTApp.register();

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <DraggedIssueProvider>
            <App/>
        </DraggedIssueProvider>
    </React.StrictMode>
);
