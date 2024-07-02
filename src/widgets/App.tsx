import "./App.css";
import { useLayoutEffect, useState } from "react";
import { host } from "./index";

export default function App() {
    const [response, setResponse] = useState<string | null>(null);
    useLayoutEffect(() => {
        host.fetchApp("backend/demo", {}).then((res: any) => setResponse(JSON.stringify(res)));
    }, []);

    return (
        <div>
            <p>
                {response ? response : "Warten..."}
            </p>
        </div>
    );
}
