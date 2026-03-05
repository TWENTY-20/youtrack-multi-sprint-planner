import {closestCenter, DndContext, useSensor, useSensors} from "@dnd-kit/core";
import {PointerSensor} from "./sensor/PointerSensor.ts";
import {KeyboardSensor} from "./sensor/KeyboardSensor.ts";
import CustomFieldsContextProvider from "./components/context/CustomFieldsContext.tsx";
import MainView from "./components/MainView.tsx";
import {Modal, ModalProvider} from "./components/context/ModalContext.tsx";
import CreateSprintPopUp from "./components/modal/CreateSprintPopUp.tsx";
import {useEffect} from "react";

export default function App() {

    useEffect(() => {
        window.onresize = () => {
            document.documentElement.style.setProperty('--window-height', window.outerHeight.toString() + 'px')
        }
    }, []);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        }),
        useSensor(KeyboardSensor)
    );

    return (
        <div className="flex flex-col space-y-4 h-full" >
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

