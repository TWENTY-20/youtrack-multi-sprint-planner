import {createContext, ReactNode, useContext, useState} from "react";
import {getSelectedCustomFieldsById} from "../../util/globalStorageAccess.ts";


export const CustomFieldsContext = createContext<CustomFieldsContextProps | undefined>(undefined)

interface CustomFieldsContextProps {
    selectedCustomFields: string []
    setSelectedCustomFields: (fields: string[]) => void
    load: (agileId: string | undefined) => void
    loading: boolean
}

export default function CustomFieldsContextProvider({children}: { children: ReactNode }) {

    const [selectedCustomFields, setSelectedCustomFields] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const load = (agileId: string | undefined) => {
        setLoading(true)
        if (!agileId) return
        void getSelectedCustomFieldsById(agileId).then(storageFields => {
            setSelectedCustomFields(storageFields ?? [])
            setLoading(false)
        })
    }

    return (
        <CustomFieldsContext.Provider value={{selectedCustomFields, setSelectedCustomFields, load, loading}}>
            {children}
        </CustomFieldsContext.Provider>
    )

}


export function useCustomFieldsContext() {
    const context = useContext(CustomFieldsContext)
    if (!context) throw new Error('useCustomFieldsContext must be used within a CustomFieldsContextProvider')
    return context
}
