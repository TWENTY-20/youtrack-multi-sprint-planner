import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@jetbrains/ring-ui-built/components/style.css";
import App from "./App";
import { DraggedIssueProvider } from "./components/draggable/DraggedIssueProvider.tsx";

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
