import ReactDOM from 'react-dom/client'
import './index.css'
import {
  QueryClientProvider
} from "@tanstack/react-query"

import {
  Routes,
  Route,
  BrowserRouter,  
  Navigate,
} from "react-router-dom"

import React, { useContext } from 'react'
import { queryClient } from './services/queryClient.ts'
import { Toaster } from 'sonner'

import SignIn from './(public)/sign-in/page.tsx'
import PrivateLayout from './(private)/layout.tsx'
import { AuthContext, AuthProvider } from './contexts/auth.context.tsx'
import GeradorPage from './(private)/gerador/page.tsx'
import DestinadorPage from './(private)/destinador/page.tsx'
import VisaoGeralPage from './(private)/movimentacao-para-o-destinador-final/page.tsx'
import ArmazenadorTemporarioPage from './(private)/armazenador-temporario/page.tsx'
import MovimentacaoParaATPage from './(private)/movimentacao-gerador-para-o-armazenador-temporario/page.tsx'
import MovimentacaoParaDFPage from './(private)/movimentacao-gerador-para-o-destinador-final/page.tsx'

const basename = import.meta.env.BASE_URL

const RootRedirector = ()=> {
  const { isLoadingAuth, loginResponse } = useContext(AuthContext)

  if(isLoadingAuth) {
    return <div>Carregando autenticação...</div>
  }

  if(!!loginResponse) {
    return <Navigate to="/gerador" replace />
  }

  return <Navigate to="/sign-in" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path='/' element={<RootRedirector />} />
              
              <Route path='/sign-in' element={<SignIn />} />
              
              <Route element={<PrivateLayout />}>
                <Route path='/gerador' element={<GeradorPage />} />
                <Route path='/destinador' element={<DestinadorPage />} />
                <Route path='/movimentacao-para-o-destinador-final' element={<VisaoGeralPage />} />
                <Route path='/armazenador-temporario' element={<ArmazenadorTemporarioPage />} />
                <Route path='/movimentacao-gerador-para-o-armazenador-temporario' element={<MovimentacaoParaATPage />} />
                <Route path='/movimentacao-gerador-para-o-destinador-final' element={<MovimentacaoParaDFPage />} />
              </Route>

              <Route path='*' element={<Navigate to="/sign-in" replace />} />
            </Routes>
          </QueryClientProvider> 
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
)
