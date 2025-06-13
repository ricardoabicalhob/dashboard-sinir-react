'use client'

import { subDays } from "date-fns"
import { createContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { type DateRange } from "react-day-picker"


interface AuthProviderProps {
    children :ReactNode
}

interface SystemContextProps {
    dateRange :DateRange
    setDateRange :Dispatch<SetStateAction<DateRange>>
    anoSelecionado :string
    setAnoSelecionado :Dispatch<SetStateAction<string>>
    anoCorrente :number
}

export const SystemContext = createContext({} as SystemContextProps)

export function SystemProvider({ children } :AuthProviderProps) {


    const anoCorrente = new Date().getFullYear()
    const [ dateRange, setDateRange ] = useState<DateRange>({
        from: subDays(new Date(Date.now()), 30),
        to: new Date(Date.now())
    })
    const [ anoSelecionado, setAnoSelecionado ] = useState<string>(anoCorrente.toString())
    
    return(
        <SystemContext.Provider value={{
            dateRange, setDateRange,
            anoSelecionado, setAnoSelecionado,
            anoCorrente
        }}>
            { children }
        </SystemContext.Provider>
    )
}