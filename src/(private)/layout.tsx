import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";
import { useContext, useEffect, useRef } from "react";
import DateRangePicker from "@/components/dateRangePicker";
import { SystemContext, SystemProvider } from "@/contexts/system.context";
import { AuthContext } from "@/contexts/auth.context";
import type { LoginResponseI } from "@/interfaces/login.interface";
import logoGestao from "../public/new-logo-2-com-texto.png"
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";
import ScrollToTopButton from "@/components/scrollToTopButton";
import YearSelectPicker from "@/components/yearSelectPicker";

interface MenuBarProps {
  loginResponse :LoginResponseI | undefined
}

function MenuBar({ loginResponse } :MenuBarProps) {

  const infoUnidadeRef = useRef<HTMLDivElement>(null)
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  async function handleDisconnect() {
    logout()
    navigate('/sign-in')
  }

  useEffect(()=> {
    setTimeout(() => {
      if (infoUnidadeRef.current) {
        infoUnidadeRef.current.classList.remove("opacity-0");
        infoUnidadeRef.current.classList.add("opacity-100");
      }
    }, 1500)
  }, [])

  return(
    <nav aria-label="Menu de navegação desktop" className="hidden overflow-x-clip border-b border-gray-200 xl:block bg-[#00695C]">
      <div className="relative">
        <ul aria-orientation="horizontal" className="mx-auto hidden max-w-[120rem] items-center justify-between p-1 text-sm xl:flex xl:px-5">
          <li className="flex items-center gap-5 divide-x divide-[#FFFFFF70]">
            <ul className="flex items-center text-gray-200 transition-colors">
              <img src={logoGestao} width={140} height={80} />
            </ul>
            <ul className="flex items-stretch gap-2 px-5">
              { loginResponse &&
                <div ref={infoUnidadeRef} className={`flex flex-col opacity-0 transition-opacity duration-1000`}>
                  <span className="text-white font-bold">{`${loginResponse?.objetoResposta.parCodigo} - ${loginResponse?.objetoResposta.parDescricao}`}</span>
                  <span className="text-white/70 text-xs">{`Usuário: ${loginResponse?.objetoResposta.paaCpf} - ${loginResponse?.objetoResposta.paaNome}`}</span>
                  <span className="text-white/70 text-xs">{`Perfil: ${loginResponse?.objetoResposta.gerador? "/Gerador" :""}${loginResponse?.objetoResposta.destinador? "/Destinador" :""}${loginResponse?.objetoResposta.armazenadorTemporario? "/Armazenador Temporário" :""}`}</span>
                </div>}
            </ul>
            
          </li>
            <div 
              className="bg-[#00BCD4] hover:filter hover:brightness-110 flex justify-end rounded-full shadow-md shadow-black/40 p-2 text-white font-semibold select-none cursor-pointer"
              onClick={()=> handleDisconnect()}  
            >
              <span className="material-symbols-outlined">exit_to_app</span>
            </div>
        </ul>

      </div>
    </nav>
  )
}

interface SubMenuBarProps {
  perfil :{
    gerador :boolean,
    armazenadorTemporario :boolean,
    destinador :boolean
  }
}

function SubMenuBar({ perfil } :SubMenuBarProps) {
  const location = useLocation()
  const pathname = location.pathname

  const {
      dateRange, setDateRange
  } = useContext(SystemContext) 

  return(
    <div className="flex items-center px-2 border-b border-b-gray-200 divide-x divide-gray-300 h-12 w-full bg-white">
      {pathname === "/visao-geral-destinacao" || pathname === "/movimentacao-gerador-para-o-destinador-final-visao-geral"
      ?
      <YearSelectPicker />
      :
      <DateRangePicker disableCalendar={pathname === "/visao-geral-destinacao"} dateRange={dateRange} setDateRange={setDateRange}/>}

      { perfil.gerador &&
        (pathname === `/gerador` ?
        <span className="text-[#00695C] font-normal leading-relaxed px-2 select-none">Gerador</span> :
        <Link to="/gerador" className="font-light px-2">Gerador</Link>) }
      
      { perfil.destinador &&
        (pathname === `/destinador` ?
        <span className="text-[#00695C] font-normal leading-relaxed select-none px-2">Destinador</span> :
        <Link to="/destinador" className="font-light px-2">Destinador</Link>) }

      { perfil.armazenadorTemporario &&
        (pathname === `/armazenador-temporario` ?
        <span className="text-[#00695C] font-normal leading-relaxed px-2 select-none">Armazenador Temporário</span> :
        <Link to="/armazenador-temporario" className="font-light px-2">Armazenador Temporário</Link>) }

      { !perfil.destinador && !perfil.armazenadorTemporario &&
        (pathname === `/movimentacao-gerador-para-o-armazenador-temporario` ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none px-2">Minhas movimentações para o armazenamento temporário</span> :
        <Link to="/movimentacao-gerador-para-o-armazenador-temporario" className="font-light px-2">Minhas movimentações para o armazenamento temporario</Link>  
        ) }

      { !perfil.destinador && !perfil.armazenadorTemporario &&
        <div className="divide-x pr-2">
          {
            (pathname === `/movimentacao-gerador-para-o-destinador-final` ?
            <span className="font-light leading-relaxed select-none px-2 py-0.5 border-b-2 border-b-[#00BCD4]">Minhas movimentações para o destinador final</span> :
            <Link to="/movimentacao-gerador-para-o-destinador-final" className="font-light px-2 py-0.5 border-b-2 border-b-gray-300">Minhas movimentações para o destinador final</Link>  
            ) }
          
          {
            (pathname === `/movimentacao-gerador-para-o-destinador-final-visao-geral` ?
            <span className="font-light leading-relaxed select-none px-2 py-0.5 border-b-2 border-b-[#00BCD4]">Visão geral</span> :
            <Link to="/movimentacao-gerador-para-o-destinador-final-visao-geral" className="font-light px-2 py-0.5 border-b-2 border-b-gray-300">Visão geral</Link>  
            ) }
        </div>
      }

      { perfil.gerador && perfil.armazenadorTemporario &&
        <div className="divide-x pr-2">
          { 
            (pathname === `/movimentacao-para-o-destinador-final` ?
            <span className="font-light leading-relaxed select-none px-2 py-0.5 border-b-2 border-b-[#00BCD4]">Movimentação para o destinador final</span> :
            <Link to="/movimentacao-para-o-destinador-final" className="font-light leading-relaxed px-2 py-0.5 border-b-2 border-b-gray-300">Movimentação para o destinador final</Link>  
            ) }

          { 
            (pathname === `/visao-geral-destinacao` ?
            <span className="font-light leading-relaxed select-none px-2 py-0.5 border-b-2 border-b-[#00BCD4]">Visão geral</span> :
            <Link to="/visao-geral-destinacao" className="font-light leading-relaxed px-2 py-0.5 border-b-2 border-b-gray-300">Visão geral</Link>  
            ) }
        </div>
      }
            
    </div>
  )
}

export default function PrivateLayout() {

  const { loginResponse, isLoadingAuth } = useContext(AuthContext)

  const navigate = useNavigate()

  useEffect(()=> {
    if(!loginResponse) {
      console.log("erro no loginResponse")
    }
  }, [loginResponse, navigate])

  if(isLoadingAuth) {
    console.log("erro no isLoadingAuth")
    return null
  }

  return (
    <SystemProvider>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col">
                <MenuBar loginResponse={loginResponse} />
                <SubMenuBar perfil={{
                  gerador: loginResponse?.objetoResposta.isGerador || false, 
                  armazenadorTemporario: loginResponse?.objetoResposta.isArmazenadorTemporario || false, 
                  destinador: loginResponse?.objetoResposta.isDestinador || false
                }}/>
                <main className="flex-1 overflow-auto p-4">
                  <Outlet />
                </main>
                
                <Toaster />
                <ScrollToTopButton />
              </div>
            </TooltipProvider>
        </QueryClientProvider>
    </SystemProvider>
  )
}
