import {closestCenter, DndContext, useSensor, useSensors} from "@dnd-kit/core";
import {PointerSensor} from "./sensor/PointerSensor.ts";
import {KeyboardSensor} from "./sensor/KeyboardSensor.ts";
import CustomFieldsContextProvider from "./components/context/CustomFieldsContext.tsx";
import MainView from "./components/MainView.tsx";

export default function App() {

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        }),
        useSensor(KeyboardSensor)
    );

    return (
        <div className="flex flex-col space-y-4 h-full" style={{height: '100rem'}}>
            <CustomFieldsContextProvider>
                <DndContext
                    collisionDetection={closestCenter}
                    sensors={sensors}
                >
                    <MainView/>
                </DndContext>
            </CustomFieldsContextProvider>
        </div>
    );
}

