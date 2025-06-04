'use client'

import { createContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { type DateRange } from "react-day-picker"


interface AuthProviderProps {
    children :ReactNode
}

interface SystemContextProps {
    dateRange :DateRange | undefined
    setDateRange :Dispatch<SetStateAction<DateRange | undefined>>
}

export const SystemContext = createContext({} as SystemContextProps)

export function SystemProvider({ children } :AuthProviderProps) {

    const [ dateRange, setDateRange ] = useState<DateRange | undefined>()
    
    return(
        <SystemContext.Provider value={{
            dateRange, setDateRange
        }}>
            { children }
        </SystemContext.Provider>
    )
}