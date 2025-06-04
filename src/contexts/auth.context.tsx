console.log("--- TESTE VITE: MÓDULO auth.context.tsx CARREGADO ---")

import type { LoginResponseI } from "@/interfaces/login.interface";
import { getAuthToken, removeAuthToken } from "@/repositories/localStorageAuth";
import { createContext, useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useLocation } from "react-router-dom";

interface AuthProviderProps {
    children :ReactNode
}

interface AuthContextProps {
    token :string | undefined
    setToken :Dispatch<SetStateAction<string | undefined>>
    loginResponse :LoginResponseI | undefined
    setLoginResponse :Dispatch<SetStateAction<LoginResponseI | undefined>>
    isLoadingAuth :boolean
    initialize :()=> void
    logout :()=> void
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthProvider({ children } :AuthProviderProps) {
    console.log("AuthProvider: INICIANDO Renderização/Potencial Remontagem.")

    const [ token, setToken ] = useState<string>()
    const [ loginResponse, setLoginResponse ] = useState<LoginResponseI>()
    const [ isLoadingAuth, setIsLoadingAuth ] = useState<boolean>(true)

    const location = useLocation()

    const logout = useCallback(()=> {
        console.log("Auth: ---- logout() chamado: REMOVENDO AUTENTICAÇÃO ----")
        removeAuthToken()
        setToken(undefined)
        setLoginResponse(undefined)
    }, [])

    const initialize = useCallback(async ()=> {
        console.log("3. initialize() CHAMADA: Iniciando processo de autenticação.")
        try {
            const authToken = getAuthToken()
            if(!authToken) {
                setLoginResponse(undefined)
                setToken(undefined)
                console.log("Nenhum token encontrado no localStorage.")
            } else {
                let authTokenDecoded :LoginResponseI
                try {
                    authTokenDecoded = JSON.parse(authToken)
                } catch (parseError) {
                    console.error("Erro ao fazer parse do token JWT do localStorage:", parseError)
                    logout()
                    return
                }

                setLoginResponse(authTokenDecoded)
                setToken(authTokenDecoded.objetoResposta.token)
            }

        } catch (error) {
            console.error("Erro na inicialização da autenticação:", error)
            logout()
        } finally {
            console.log("9. initialize() FINALIZADA. isLoadingAuth:", isLoadingAuth, "loginResponse:", loginResponse ? 'DEFINIDO' : 'UNDEFINED')
            setIsLoadingAuth(false)
        }
    }, [logout])

    useEffect(()=> {
        console.log("2. AuthProvider useEffect: Executando. Chamando initialize().")
        initialize()
    }, [initialize, location.pathname])

    const contextValue = useMemo(()=> ({
        token, setToken, initialize,
        loginResponse, setLoginResponse,
        isLoadingAuth,
        logout
    }), [token, setToken, initialize, loginResponse, setLoginResponse, isLoadingAuth, logout])

    console.log(`Auth: AuthProvider renderizado. isLoadingAuth: ${isLoadingAuth}, loginResponse: ${loginResponse ? 'DEFINIDO' : 'UNDEFINED'}`)

    return(
        <AuthContext.Provider value={contextValue}>
            { children }
        </AuthContext.Provider>
    )
}