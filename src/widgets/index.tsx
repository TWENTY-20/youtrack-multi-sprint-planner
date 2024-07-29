import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@jetbrains/ring-ui-built/components/style.css";
import App from "./App";
import { Host } from "./types";
import { DraggedIssueProvider } from "./DraggedIssueProvider";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import English from "./locales/en.json";
import German from "./locales/de.json";

declare const YTApp: {
    locale: string,
    register: () => Promise<Host>
};

export const host = await YTApp.register();

await i18next
    .use(initReactI18next)
    .init({
        lng: "de",
        fallbackLng: "en",
        resources: {
            en: {
                translation: English
            },
            de: {
                translation: German
            }
        },
        debug: true,
        supportedLngs: ["en", "de"],
        nonExplicitSupportedLngs: true,
        interpolation: {
            escapeValue: false,
        }
    });

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
