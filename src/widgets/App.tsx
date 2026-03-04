import {closestCenter, DndContext, useSensor, useSensors} from "@dnd-kit/core";
import {PointerSensor} from "./sensor/PointerSensor.ts";
import {KeyboardSensor} from "./sensor/KeyboardSensor.ts";
import CustomFieldsContextProvider from "./components/context/CustomFieldsContext.tsx";
import MainView from "./components/MainView.tsx";
import {Modal, ModalProvider} from "./components/context/ModalContext.tsx";
import CreateSprintPopUp from "./components/modal/CreateSprintPopUp.tsx";

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
                <ModalProvider>
                    <DndContext
                        collisionDetection={closestCenter}
                        sensors={sensors}
                    >
                        <MainView/>
                    </DndContext>
                    <Modal id={'createSprint'} component={CreateSprintPopUp} />

                </ModalProvider>
            </CustomFieldsContextProvider>
        </div>
    );
}

