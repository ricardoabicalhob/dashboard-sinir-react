import CustomMessage from "@/components/customMessage"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import { AuthContext } from "@/contexts/auth.context"
import { type LoginResponseI } from "@/interfaces/login.interface"
import { type MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeRecebimentoDentroDoPeriodo, agruparPorTipoDeResiduo, agruparPorMesDeRecebimento, totalizarPorMesDeRecebimento, type GroupByWasteTypeOutput } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import GraficoAnualBarras from "@/components/graficoAnualBarras"
import { SystemContext } from "@/contexts/system.context"
import { GraficoPizza } from "@/components/graficoPizza"

export default function MovimetacaoGeradorParaDestinadorFinalVisaoGeral() {

    const { 
        loginResponse
    } = useContext(AuthContext)

    const {
        anoSelecionado
    } = useContext(SystemContext)
    
    const dateToTrimestre4 :Date = new Date(formatarDataDDMMYYYYParaMMDDYYYY(`31/12/${anoSelecionado}`) || "")
    const dateFromTrimestre4 :Date= new Date(formatarDataDDMMYYYYParaMMDDYYYY((subDays(dateToTrimestre4, 90)).toLocaleDateString()) || "")
    const dateFromTrimestre3 = subDays(dateFromTrimestre4, 90)
    const dateToTrimestre3 = subDays(dateFromTrimestre4, 1)
    const dateFromTrimestre2 = subDays(dateFromTrimestre3, 90)
    const dateToTrimestre2 = subDays(dateFromTrimestre3, 1)
    const dateFromTrimestre1 = subDays(dateFromTrimestre2, 90)
    const dateToTrimestre1 = subDays(dateFromTrimestre2, 1)
    const dateFromTrimestre4AnoAnterior = subDays(dateFromTrimestre1, 90)
    const dateToTrimestre4AnoAnterior = subDays(dateFromTrimestre1, 1)
    const dateFromTrimestre3_ultimos10dias_AnoAnterior = subDays(dateFromTrimestre4AnoAnterior, 10)
    const dateToTrimestre3_ultimos10dias_AnoAnterior = subDays(dateFromTrimestre3_ultimos10dias_AnoAnterior, 1)

    const [ profile, setProfile ] = useState<LoginResponseI>()
    const [ dataGraficoPizza, setDataGraficoPizza ] = useState<GroupByWasteTypeOutput[]>()
    const [ mesSelecionadoGraficoPizza, setMesSelecionadoGraficoPizza ] = useState<string>()

    useEffect(()=> {
        if(!profile) {
            setProfile(loginResponse)
        }
    }, [loginResponse])

    const { 
        data: referencePeriodTrimestre4_ListGerador, 
        isSuccess: isSuccessListGerador_trimestre4,
        isError: isErrorListGerador_trimestre4,
        error: errorListGerador_trimestre4
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 1, dateFromTrimestre4], 
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromTrimestre4), formatarDataParaAPI(dateToTrimestre4), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })

    const {
        data: referencePeriodTrimestre3_ListGerador,
        isSuccess: isSuccessListGerador_trimestre3,
        isError: isErrorListGerador_trimestre3,
        error: errorListGerador_trimestre3
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 2, dateFromTrimestre3], 
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromTrimestre3), formatarDataParaAPI(dateToTrimestre3), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })

    const {
        data: referencePeriodTrimestre2_ListGerador,
        isSuccess: isSuccessListGerador_trimestre2,
        isError: isErrorListGerador_trimestre2,
        error: errorListGerador_trimestre2
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 3, dateFromTrimestre2],
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromTrimestre2), formatarDataParaAPI(dateToTrimestre2), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })
    
    const {
        data: referencePeriodTrimestre1_ListGerador,
        isSuccess: isSuccessListGerador_trimestre1,
        isError: isErrorListGerador_trimestre1,
        error: errorListGerador_trimestre1
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 4, dateFromTrimestre1],
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromTrimestre1), formatarDataParaAPI(dateToTrimestre1), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })
    
    const {
        data: referencePeriodTrimestre4_AnoAnterior_ListGerador,
        isSuccess: isSuccessListGerador_trimestre4_AnoAnterior,
        isError: isErrorListGerador_trimestre4_AnoAnterior,
        error: errorListGerador_trimestre4_AnoAnterior
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 5, dateFromTrimestre4AnoAnterior],
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromTrimestre4AnoAnterior), formatarDataParaAPI(dateToTrimestre4AnoAnterior), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })

    const {
        data: referencePeriodTrimestre3_ultimos10dias_AnoAnterior_ListGerador,
        isSuccess: isSuccessListGerador_trimestre3_ultimos10dias_AnoAnterior,
        isError: isErrorListGerador_trimestre3_ultimos10dias_AnoAnterior,
        error: errorListGerador_trimestre3_ultimos10dias_AnoAnterior
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 6, dateFromTrimestre3_ultimos10dias_AnoAnterior],
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromTrimestre3_ultimos10dias_AnoAnterior), formatarDataParaAPI(dateToTrimestre3_ultimos10dias_AnoAnterior), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })

    const allMtrsGerador = useMemo(() => {
        return [    
            ...referencePeriodTrimestre4_ListGerador ?? [],
            ...referencePeriodTrimestre3_ListGerador ?? [], 
            ...referencePeriodTrimestre2_ListGerador ?? [], 
            ...referencePeriodTrimestre1_ListGerador ?? [], 
            ...referencePeriodTrimestre4_AnoAnterior_ListGerador ?? [],
            ...referencePeriodTrimestre3_ultimos10dias_AnoAnterior_ListGerador ?? []
        ];
    }, [
            referencePeriodTrimestre4_ListGerador, 
            referencePeriodTrimestre3_ListGerador, 
            referencePeriodTrimestre2_ListGerador, 
            referencePeriodTrimestre1_ListGerador, 
            referencePeriodTrimestre4_AnoAnterior_ListGerador,
            referencePeriodTrimestre3_ultimos10dias_AnoAnterior_ListGerador
        ]
    );
    
    const { 
        data: detailedReferencePeriodListGerador,
        isLoading: isLoadingDetailsGerador,
        isError: isErrorDetailsGerador,
        error: errorDetailsGerador
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['mtrDetailsGerador', 1, allMtrsGerador],
        queryFn: async ()=> await getMtrDetails(allMtrsGerador || [], profile?.objetoResposta.token || ""),
        enabled: !!referencePeriodTrimestre3_ultimos10dias_AnoAnterior_ListGerador && !!profile?.objetoResposta.token,
    })

    const isLoadingGerador = !isSuccessListGerador_trimestre4 || !isSuccessListGerador_trimestre3 || !isSuccessListGerador_trimestre2 || !isSuccessListGerador_trimestre1 || !isSuccessListGerador_trimestre4_AnoAnterior || !isSuccessListGerador_trimestre3_ultimos10dias_AnoAnterior;
    const isErrorGerador = isErrorListGerador_trimestre4 || isErrorListGerador_trimestre3 || isErrorListGerador_trimestre2 || isErrorListGerador_trimestre1 || isErrorListGerador_trimestre4_AnoAnterior || isErrorListGerador_trimestre3_ultimos10dias_AnoAnterior;
    const errorGerador = errorListGerador_trimestre4 || errorListGerador_trimestre3 || errorListGerador_trimestre2 || errorListGerador_trimestre1 || errorListGerador_trimestre4_AnoAnterior || errorListGerador_trimestre3_ultimos10dias_AnoAnterior;
    
    if (isLoadingGerador) return <CustomMessage message="Carregando lista de MTRs do Gerador..."/>
    if (isErrorGerador && errorGerador) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {errorGerador.message}</p>;
    
    if (isLoadingDetailsGerador) return <CustomMessage message="Carregando detalhes dos MTRs do Gerador..."/>
    if (isErrorDetailsGerador && errorDetailsGerador) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetailsGerador.message}</p>;

    return(
        <div id="topo" className="flex flex-col gap-6 p-6">
            
            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Minha movimentação como gerador para o destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${anoSelecionado}`}</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFromTrimestre1, dateToTrimestre4))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                </ScoreboardItem>
                
                <ScoreboardItem>
                    <ScoreboardTitle>Minha movimentação total para destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${anoSelecionado}`}</ScoreboardSubtitle>
                    <ScoreboardMainText>{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFromTrimestre1, dateToTrimestre4)
                    ])).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                </ScoreboardItem>
            </Scoreboard>

            <div className="grid grid-col-row grid-cols-3 gap-2">

                <div className="col-span-2">
                    <GraficoAnualBarras 
                        title="Destinação total de resíduos por mês"
                        setDataResiduos={setDataGraficoPizza}
                        setMesSelecionado={setMesSelecionadoGraficoPizza}
                        dataMTRs={agruparPorMesDeRecebimento(
                            filtrarTudoComDataDeRecebimentoDentroDoPeriodo(
                                [...detailedReferencePeriodListGerador ?? []], 
                                dateFromTrimestre1, 
                                dateToTrimestre4
                            )
                        )}
                        subTitle={anoSelecionado}
                        acumulated={totalizarQuantidadeRecebida(
                            agruparPorTipoDeResiduo(
                                filtrarTudoComDataDeRecebimentoDentroDoPeriodo(
                                    [...detailedReferencePeriodListGerador ?? []], 
                                    dateFromTrimestre1, 
                                    dateToTrimestre4
                                )
                            )
                        )}
                        dataChart={
                            totalizarPorMesDeRecebimento(
                                agruparPorMesDeRecebimento(
                                    filtrarTudoComDataDeRecebimentoDentroDoPeriodo(
                                        [...detailedReferencePeriodListGerador ?? []], 
                                        dateFromTrimestre1, 
                                        dateToTrimestre4
                                    )
                                )
                            )
                        }
                    />
                </div>

                <GraficoPizza 
                    dataChart={dataGraficoPizza ?? []} 
                    mesSelecionado={mesSelecionadoGraficoPizza || ""} 
                    titulo="Tipos de Resíduos"
                />
            </div>

        </div>
    )
}