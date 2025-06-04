import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import GraficoSimples from "@/components/graficoSimples"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import { Switch, SwitchButton } from "@/components/switch"
import ListaDeMtrs from "@/components/listaDeMtrs"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { type LoginResponseI } from "@/interfaces/login.interface"
import { type MTRResponseI } from "@/interfaces/mtr.interface"
import generatePdfListaMtrsDownload from "@/repositories/generatePdfListaMtrsDownload"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeEmissaoDentroDoPeriodo, filtrarTudoComDataDeRecebimentoDentroDoPeriodo, filtrarTudoSemDataDeRecebimento, agruparPorTipoDeResiduo } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { Info } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

export default function DestinadorPage() {

    const { 
        token,
        loginResponse
    } = useContext(AuthContext)
    const [ dateFrom, setDateFrom ] = useState<Date>(new Date(formatarDataDDMMYYYYParaMMDDYYYY(subDays(new Date(Date.now()), 30).toLocaleDateString()) || ""))
    const [ dateTo, setDateTo ] = useState<Date>(new Date(formatarDataDDMMYYYYParaMMDDYYYY(new Date(Date.now()).toLocaleDateString()) || ""))
    const dateFromBefore = subDays(dateFrom, 90)
    const dateToBefore = subDays(dateFrom, 1)
    const dateFromBeforeBefore = subDays(dateFromBefore, 90)
    const dateToBeforeBefore = subDays(dateFromBefore, 1)
    const [ profile, setProfile ] = useState<LoginResponseI>()

    const [ hideChartManifestsGenerated, setHideChartManifestsGenerated ] = useState(false)
    const [ hideChartManifestsReceived, setHideChartManifestsReceived ] = useState(false)
    const [ hideChartManifestsPending, setHideChartManifestsPending ] = useState(false)

    const {
        dateRange
    } = useContext(SystemContext)

    function handleShowChartManifestsGenerated() {
        setHideChartManifestsGenerated(false)
    }

    function handleShowListManifestsGenerated() {
        setHideChartManifestsGenerated(true)
    }

    function handleShowChartManifestsReceived() {
        setHideChartManifestsReceived(false)
    }

    function handleShowListManifestsReceived() {
        setHideChartManifestsReceived(true)
    }

    function handleShowChartManifestsPending() {
        setHideChartManifestsPending(false)
    }

    function handleShowListManifestsPending() {
        setHideChartManifestsPending(true)
    }

    useEffect(()=> {
        if(dateRange) {
            setDateFrom(new Date(formatarDataDDMMYYYYParaMMDDYYYY(dateRange.from?.toLocaleDateString() || "") || ""))
            setDateTo(new Date(formatarDataDDMMYYYYParaMMDDYYYY(dateRange.to?.toLocaleDateString() || "") || ""))
        }
    }, [dateRange])

    useEffect(()=> {
        if(!profile) {
            setProfile(loginResponse)
        }
    }, [loginResponse])

    const {
        data: referencePeriodList, 
        isSuccess: isSuccessList,
        isError: isErrorList,
        error: errorList
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrs', 1, dateFrom, dateTo], 
        queryFn: async ()=> await getMtrList("Destinador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore],
        queryFn: async ()=> await getMtrList("Destinador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodListMore,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateFromBeforeBefore],
        queryFn: async ()=> await getMtrList("Destinador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const allMtrs = useMemo(() => {
        if (referencePeriodList && extendedPeriodList && extendedPeriodListMore) {
            return [...referencePeriodList, ...extendedPeriodList];
        }
        if (referencePeriodList) {
            return referencePeriodList;
        }
        if (extendedPeriodList) {
            return extendedPeriodList;
        }
        if (extendedPeriodListMore) {
            return extendedPeriodListMore;
        }
        return [];
    }, [referencePeriodList, extendedPeriodList, extendedPeriodListMore]);

    const { 
        data: detailedReferencePeriodList,
        isLoading: isLoadingDetails,
        isError: isErrorDetails,
        error: errorDetails
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['mtrDetails', 1, allMtrs],
        queryFn: async ()=> await getMtrDetails(allMtrs || [], token || ""),
        enabled: !!extendedPeriodList
    })
    
    const isLoading = !isSuccessList || !isSuccessListExtented || !isSuccessListExtentedMore
    const isError = isErrorList || isErrorListExtented || isErrorListExtentedMore;
    const error = errorList || errorListExtented || errorListExtentedMore;
    
    if (isLoading) return <CustomMessage message="Carregando lista de MTRs..."/>
    if (isError && error) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {error.message}</p>;
    
    if(isLoadingDetails) return <CustomMessage message="Carregando detalhes dos MTRs..."/>
    if (isErrorDetails && errorDetails) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetails.message}</p>;

    if(!allMtrs.length) {
        return(
            <div className="flex gap-2 w-full h-[calc(100vh-117px)] items-center justify-center text-black/80">
                <Info />
                <p>Não há nada para exibir para este destinador</p>
            </div>
        )
    }

    return(
        <div id="topo" className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Meus resíduos como destinador</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#geradosParaMim">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos recebidos como destinador</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#recebidosPorMim">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos ainda não recebidos como destinador</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-red-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#pendentes">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
            </Scoreboard>

            <div id="geradosParaMim"/>
            {
                !hideChartManifestsGenerated &&
                    <GraficoSimples
                        title="Meus resíduos como destinador"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsGenerated &&
                    <ListaDeMtrs
                        title="Meus manifestos como destinador"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsGenerated}
                    setDisableButton={()=> handleShowChartManifestsGenerated()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsGenerated}
                    setDisableButton={()=> handleShowListManifestsGenerated()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                {
                hideChartManifestsGenerated &&
                    <SwitchButton
                        className="bg-yellow-400 hover:bg-yellow-400/50"
                        disableButton={!hideChartManifestsGenerated}
                        setDisableButton={()=> {}}
                        onClick={()=> generatePdfListaMtrsDownload(
                            `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                            "MEUS MANIFESTOS COMO DESTINADOR",
                            `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                            filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                            ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR"]
                        )}
                    >
                        {/* <Download /> Baixar PDF */}
                        Download <span className="material-icons">picture_as_pdf</span>
                    </SwitchButton>
                }
                <a href="#topo">
                    <SwitchButton
                        className="bg-gray-400 hover:bg-gray-400/50"
                        disableButton={false}
                        setDisableButton={()=> {}}

                    >
                        {/* <ArrowUp /> */}
                        Ir para o topo
                        <span className="material-icons">arrow_upward</span>
                    </SwitchButton>
                </a>
            </Switch>
    
            <div id="recebidosPorMim"/>
            {
                !hideChartManifestsReceived &&
                    <GraficoBarraDupla
                        title="Resíduos recebidos como destinador"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsReceived &&
                    <ListaDeMtrs
                        title="Manifestos recebidos como destinador"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsReceived}
                    setDisableButton={()=> handleShowChartManifestsReceived()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsReceived}
                    setDisableButton={()=> handleShowListManifestsReceived()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                {
                    hideChartManifestsReceived &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsReceived}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS RECEBIDOS COMO DESTINADOR",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]
                            )}
                        >
                            {/* <Download /> Baixar PDF */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }
                <a href="#topo">
                    <SwitchButton
                        className="bg-gray-400 hover:bg-gray-400/50"
                        disableButton={false}
                        setDisableButton={()=> {}}

                    >
                        {/* <ArrowUp /> */}
                        Ir para o topo
                        <span className="material-icons">arrow_upward</span>
                    </SwitchButton>
                </a>
            </Switch>

            <div id="pendentes"/>
            {
                !hideChartManifestsPending &&
                    <GraficoSimples 
                        title="Resíduos ainda não recebidos como destinador"
                        subTitle={`Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsPending &&
                    <ListaDeMtrs
                        title="Manifestos ainda não recebidos como destinador"
                        subtitle={`Manifestos emitidos dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsPending}
                    setDisableButton={()=> handleShowChartManifestsPending()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsPending}
                    setDisableButton={()=> handleShowListManifestsPending()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                {
                    hideChartManifestsPending &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsPending}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS AINDA NÃO RECEBIDOS COMO DESTINADOR",
                                `Manifestos emitidos de ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR"]
                            )}
                        >
                            {/* <Download /> Baixar PDF */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }
                <a href="#topo">
                    <SwitchButton
                        className="bg-gray-400 hover:bg-gray-400/50"
                        disableButton={false}
                        setDisableButton={()=> {}}

                    >
                        {/* <ArrowUp /> */}
                        Ir para o topo
                        <span className="material-icons">arrow_upward</span>
                    </SwitchButton>
                </a>
                
            </Switch>

        </div>
    )
}