import { Host } from "./types.ts";

declare const YTApp: {
    locale: string,
    register: () => Promise<Host>
};

export const host = await YTApp.register();

export default YTApp;
