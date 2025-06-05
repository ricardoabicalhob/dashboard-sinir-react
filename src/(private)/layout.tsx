import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";
import { useContext, useEffect, useRef } from "react";
import DateRangePicker from "@/components/dateRangePicker";
import { SystemContext, SystemProvider } from "@/contexts/system.context";
import { AuthContext } from "@/contexts/auth.context";
import type { LoginResponseI } from "@/interfaces/login.interface";
import logoGestao from "../public/new-logo-2-com-texto.png"
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";

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

  const basename = import.meta.env.BASE_URL

  return(
    <div className="flex items-center px-2 border-b border-b-gray-200 divide-x divide-gray-300 h-12 w-full bg-white">
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange}/>

      { perfil.gerador &&
        (pathname === `${basename}/gerador` ?
        <span className="text-[#00695C] font-normal leading-relaxed px-2 select-none">Gerador</span> :
        <a href={`${basename}/gerador`} className="font-light px-2">Gerador</a>) }
      
      { perfil.armazenadorTemporario &&
        (pathname === `${basename}/armazenador-temporario` ?
        <span className="text-[#00695C] font-normal leading-relaxed px-2 select-none">Armazenador Temporário</span> :
        <a href={`${basename}/armazenador-temporario`} className="font-light px-2">Armazenador Temporário</a>) }
      
      { perfil.destinador &&
        (pathname === `${basename}/destinador` ?
        <span className="text-[#00695C] font-normal leading-relaxed select-none px-2">Destinador</span> :
        <a href={`${basename}/destinador`} className="font-light px-2">Destinador</a>) }

      { perfil.gerador && perfil.armazenadorTemporario &&
        (pathname === `${basename}/movimentacao-para-o-destinador-final` ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none pl-2">Movimentação para o destinador final</span> :
        <a href={`${basename}/movimentacao-para-o-destinador-final`} className="font-light pl-2">Movimentação para o destinador final</a>  
        ) }

      { !perfil.destinador && !perfil.armazenadorTemporario &&
        (pathname === `${basename}/movimentacao-gerador-para-o-armazenador-temporario` ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none px-2">Minhas movimentações para o armazenamento temporário</span> :
        <a href={`${basename}/movimentacao-gerador-para-o-armazenador-temporario`} className="font-light px-2">Minhas movimentações para o armazenamento temporario</a>  
        ) }

      { !perfil.destinador && !perfil.armazenadorTemporario &&
        (pathname === `${basename}/movimentacao-gerador-para-o-destinador-final` ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none pl-2">Minhas movimentações para o destinador final</span> :
        <a href={`${basename}/movimentacao-gerador-para-o-destinador-final`} className="font-light pl-2">Minhas movimentações para o destinador final</a>  
        ) }      
    </div>
  )
}

export default function PrivateLayout() {
  console.log("PrivateLayout: INICIANDO Renderização/Potencial Remontagem.")

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
              </div>
            </TooltipProvider>
        </QueryClientProvider>
    </SystemProvider>
  )
}
