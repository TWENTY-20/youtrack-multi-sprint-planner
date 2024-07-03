import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@jetbrains/ring-ui-built/components/style.css";
import App from "./App";

declare var YTApp: any;

// @ts-ignore
export const host = await YTApp.register();

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
