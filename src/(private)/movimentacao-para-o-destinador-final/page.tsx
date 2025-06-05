import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import { Switch, SwitchButton } from "@/components/switch"
import TabelaDemonstrativaSimples from "@/components/tabelaDemonstrativaSimples"
import ListaDeMtrs from "@/components/listaDeMtrs"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { type LoginResponseI } from "@/interfaces/login.interface"
import { type MTRResponseI } from "@/interfaces/mtr.interface"
import generatePdfListaMtrsPorDestinadorDownload from "@/repositories/generatePdfListaMtrsPorDestinadorDownload"
import { generatePdfTableDestinacao, prepareDataForPdf } from "@/repositories/generatePdfTableDestinacao"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeRecebimentoDentroDoPeriodo, agruparPorGerador, agruparPorTipoDeResiduo, agruparPorDestinador, agruparPorGeradorEDestinador } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import TabelaDemonstrativaCompleta from "@/components/tabelaDemonstrativaCompleta"

export default function VisaoGeralPage() {

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
    const [ showChartManifestsReceivedSentFromTheGenerator, setShowChartManifestsReceivedSentFromTheGenerator ] = useState(false)
    const [ showListManifestsReceivedSentFromTheGenerator, setShowListManifestsReceivedSentFromTheGenerator ] = useState(true)
    const [ showTableManifestsReceivedSentFromTheGenerator, setShowTableManifestsReceivedSentFromTheGenerator ] = useState(true)
    const [ showChartManifestsReceivedSentFromAT, setShowChartManifestsReceivedSentFromAT ] = useState(false)
    const [ showListManifestsReceivedSentFromAT, setShowListManifestsReceivedSentFromAT ] = useState(true)
    const [ showTableManifestsReceivedSentFromAT, setShowTableManifestsReceivedSentFromAT ] = useState(true)
    const [ showTableATOriginDetails, setShowTableATOriginDetails ] = useState(true)
    const [ showChartManifestsReceivedSentFromTheGeneratorAndAT, setShowChartManifestsReceivedSentFromTheGeneratorAndAT ] = useState(false)
    const [ showListManifestsReceivedSentFromTheGeneratorAndAT, setShowListManifestsReceivedSentFromTheGeneratorAndAT ] = useState(true)
    const [ showTableManifestsReceivedSentFromTheGeneratorAndAT, setShowTableManifestsReceivedSentFromTheGeneratorAndAT ] = useState(true)
    const [ showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT, setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT ] = useState(true)
    
    function handleShowTableManifestsReceivedSentFromTheGenerator() {
        setShowTableManifestsReceivedSentFromTheGenerator(false)
        setShowListManifestsReceivedSentFromTheGenerator(true)
        setShowChartManifestsReceivedSentFromTheGenerator(true)
    }

    function handleShowListManifestsReceivedSentFromTheGenerator() {
        setShowListManifestsReceivedSentFromTheGenerator(false)
        setShowChartManifestsReceivedSentFromTheGenerator(true)
        setShowTableManifestsReceivedSentFromTheGenerator(true)
    }

    function handleShowChartManifestsReceivedSentFromTheGenerator() {
        setShowChartManifestsReceivedSentFromTheGenerator(false)
        setShowListManifestsReceivedSentFromTheGenerator(true)
        setShowTableManifestsReceivedSentFromTheGenerator(true)
    }

    function handleShowTableManifestsReceivedSentFromAT() {
        setShowTableManifestsReceivedSentFromAT(false)
        setShowListManifestsReceivedSentFromAT(true)
        setShowChartManifestsReceivedSentFromAT(true)
        setShowTableATOriginDetails(true)
    }

    function handleShowListManifestsReceivedSentFromAT() {
        setShowListManifestsReceivedSentFromAT(false)
        setShowChartManifestsReceivedSentFromAT(true)
        setShowTableManifestsReceivedSentFromAT(true)
        setShowTableATOriginDetails(true)

    }

    function handleShowChartManifestsReceivedSentFromAT() {
        setShowChartManifestsReceivedSentFromAT(false)
        setShowListManifestsReceivedSentFromAT(true)
        setShowTableManifestsReceivedSentFromAT(true)
        setShowTableATOriginDetails(true)
    }

    function handleShowTableATOriginDetails() {
        setShowTableATOriginDetails(false)
        setShowChartManifestsReceivedSentFromAT(true)
        setShowListManifestsReceivedSentFromAT(true)
        setShowTableManifestsReceivedSentFromAT(true)
    }

    function handleShowChartManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(true)
    }

    function handleShowListManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(true)

    }

    function handleShowTableManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(true)
    }

    function handleShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(true)
    }

    const {
        dateRange
    } = useContext(SystemContext)

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
        data: referencePeriodListGerador, 
        isSuccess: isSuccessListGerador,
        isError: isErrorListGerador,
        error: errorListGerador
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 1, dateFrom], 
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })

    const {
        data: extendedPeriodListGerador,
        isSuccess: isSuccessListExtentedGerador,
        isError: isErrorListExtentedGerador,
        error: errorListExtentedGerador
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 2, dateFromBefore], 
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })

    const {
        data: extendedPeriodListMoreGerador,
        isSuccess: isSuccessListExtentedMoreGerador,
        isError: isErrorListExtentedMoreGerador,
        error: errorListExtentedMoreGerador
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsGerador', 3, dateFromBeforeBefore],
        queryFn: async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
    })
    
    const allMtrsGerador = useMemo(() => {
        if (referencePeriodListGerador && extendedPeriodListGerador && extendedPeriodListMoreGerador) {
            return [...referencePeriodListGerador, ...extendedPeriodListGerador, ...extendedPeriodListMoreGerador];
        }
        if (referencePeriodListGerador) {
            return referencePeriodListGerador;
        }
        if (extendedPeriodListGerador) {
            return extendedPeriodListGerador;
        }
        if(extendedPeriodListMoreGerador) {
            return extendedPeriodListMoreGerador; 
        }
        return [];
    }, [referencePeriodListGerador, extendedPeriodListGerador, extendedPeriodListMoreGerador]);
    
    const { 
        data: detailedReferencePeriodListGerador,
        isLoading: isLoadingDetailsGerador,
        isError: isErrorDetailsGerador,
        error: errorDetailsGerador
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['mtrDetailsGerador', 1, allMtrsGerador],
        queryFn: async ()=> await getMtrDetails(allMtrsGerador || [], profile?.objetoResposta.token || ""),
        enabled: !!extendedPeriodListGerador && !!profile?.objetoResposta.token,
    })

    const {
        data: referencePeriodListAT, 
        isSuccess: isSuccessListAT,
        isError: isErrorListAT,
        error: errorListAT
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsAT', 1, dateFrom, dateTo],
        queryFn: async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodListAT,
        isSuccess: isSuccessListExtentedAT,
        isError: isErrorListExtentedAT,
        error: errorListExtentedAT
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsAT', 2, dateFromBefore, dateToBefore],
        queryFn: async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedMorePeriodListAT,
        isSuccess: isSuccessListExtentedMoreAT,
        isError: isErrorListExtentedMoreAT,
        error: errorListExtentedMoreAT
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['referencePeriodListMtrsAT', 3, dateFromBeforeBefore, dateToBeforeBefore],
        queryFn: async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]),
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const allMtrsAT = useMemo(() => {
        if (referencePeriodListAT && extendedPeriodListAT && extendedMorePeriodListAT) {
            return [...referencePeriodListAT, ...extendedPeriodListAT, ...extendedMorePeriodListAT];
        }
        if (referencePeriodListAT) {
            return referencePeriodListAT;
        }
        if (extendedPeriodListAT) {
            return extendedPeriodListAT;
        }
        if(extendedMorePeriodListAT) {
            return extendedMorePeriodListAT;
        }
        return [];
    }, [referencePeriodListAT, extendedPeriodListAT, extendedMorePeriodListAT]);

    const { 
        data: detailedReferencePeriodListAT,
        isLoading: isLoadingDetailsAT,
        isError: isErrorDetailsAT,
        error: errorDetailsAT
    } = useQuery<MTRResponseI[], Error>({
        queryKey: ['mtrDetailsAT', 1, allMtrsAT],
        queryFn: async ()=> await getMtrDetails(allMtrsAT || [], token || ""),
        enabled: !!referencePeriodListAT && !!extendedPeriodListAT && !!extendedMorePeriodListAT
    })

    const isLoadingGerador = !isSuccessListGerador || !isSuccessListExtentedGerador || !isSuccessListExtentedMoreGerador;
    const isErrorGerador = isErrorListGerador || isErrorListExtentedGerador || isErrorListExtentedMoreGerador;
    const errorGerador = errorListGerador || errorListExtentedGerador || errorListExtentedMoreGerador;
    
    if (isLoadingGerador) return <CustomMessage message="Carregando lista de MTRs do Gerador..."/>
    if (isErrorGerador && errorGerador) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {errorGerador.message}</p>;
    
    if (isLoadingDetailsGerador) return <CustomMessage message="Carregando detalhes dos MTRs do Gerador..."/>
    if (isErrorDetailsGerador && errorDetailsGerador) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetailsGerador.message}</p>;



    const isLoadingAT = !isSuccessListAT || !isSuccessListExtentedAT || !isSuccessListExtentedMoreAT
    const isErrorAT = isErrorListAT || isErrorListExtentedAT || isErrorListExtentedMoreAT;
    const errorAT = errorListAT || errorListExtentedAT || errorListExtentedMoreAT;
    
    if (isLoadingAT) return <CustomMessage message="Carregando lista de MTRs do Armazenamento Temporário..."/>
    if (isErrorAT && errorAT) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs do Armazenamento Temporário: {errorAT.message}</p>;
    
    if(isLoadingDetailsAT) return <CustomMessage message="Carregando detalhes dos MTRs do Armazenamento Temporário..."/>
    if (isErrorDetailsAT && errorDetailsAT) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs do Armazenamento Temporário: {errorDetailsAT.message}</p>;

    return(
        <div id="topo" className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Minha movimentação como gerador para o destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#movimentacaoGeradorParaDestinador">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Minha movimentação como Armazenador Temporário para o destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#movimentacaoATParaDestinador">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Minha movimentação total para destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}</ScoreboardSubtitle>
                    <ScoreboardMainText>{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                    ])).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#movimentacaoTotal">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
            </Scoreboard>

            <div id="movimentacaoGeradorParaDestinador"/>
            {!showChartManifestsReceivedSentFromTheGenerator &&
                <GraficoBarraDupla
                    title="Minha movimentação como gerador para o destinador final"
                    subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo)))}
                    dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo))}
                />}

            {!showListManifestsReceivedSentFromTheGenerator &&
                <ListaDeMtrs
                    title="Meus manifestos como gerador recebidos pelo destinador final"
                    subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo)}
                    authorization={profile?.objetoResposta.token || ""}
                    options={["Destinador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]}
                />}

            {!showTableManifestsReceivedSentFromTheGenerator &&
                <TabelaDemonstrativaSimples
                    tipo="Destinador"
                    title="Detalhes da destinação - Meus resíduos como gerador"
                    periodo={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo))}
                />}

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceivedSentFromTheGenerator}
                    setDisableButton={()=> handleShowChartManifestsReceivedSentFromTheGenerator()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceivedSentFromTheGenerator}
                    setDisableButton={()=> handleShowListManifestsReceivedSentFromTheGenerator()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableManifestsReceivedSentFromTheGenerator}
                    setDisableButton={()=> handleShowTableManifestsReceivedSentFromTheGenerator()}
                >
                    {/* <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação */}
                    Detalhes da destinação <span className="material-icons">feed</span>
                </SwitchButton>
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

            <div id="movimentacaoATParaDestinador"/>
            {!showChartManifestsReceivedSentFromAT &&
                <GraficoBarraDupla
                    title="Minha movimentação como armazenador temporário para o destinador final"
                    subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)))}
                    dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
                />}

            {!showListManifestsReceivedSentFromAT &&
                <ListaDeMtrs
                    title="Manifestos como armazenador temporário recebidos pelo destinador"
                    subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)}
                    authorization={profile?.objetoResposta.token || ""}
                    options={["Gerador", "Destinador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]}
                />}

            {!showTableATOriginDetails &&
                <TabelaDemonstrativaSimples
                    tipo="Gerador"
                    title="Detalhes de origem dos resíduos de saída do armazenamento temporário"
                    periodo={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    listaAgrupadaPorDestinadorOuGerador={agruparPorGerador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
                />}

            {!showTableManifestsReceivedSentFromAT &&
                <TabelaDemonstrativaSimples
                    tipo="Destinador"
                    title="Detalhes da destinação - Meus resíduos como armazenador temporário"
                    periodo={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
                />}

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceivedSentFromAT}
                    setDisableButton={()=> handleShowChartManifestsReceivedSentFromAT()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceivedSentFromAT}
                    setDisableButton={()=> handleShowListManifestsReceivedSentFromAT()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableATOriginDetails}
                    setDisableButton={()=> handleShowTableATOriginDetails()}
                >
                    {/* <Sheet className="w-4 h-4 text-white"/> Detalhes da origem */}
                    Detalhes da origem<span className="material-icons">feed</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableManifestsReceivedSentFromAT}
                    setDisableButton={()=> handleShowTableManifestsReceivedSentFromAT()}
                >
                    {/* <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação */}
                    Detalhes da destinação<span className="material-icons">feed</span>
                </SwitchButton>
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

            <div id="movimentacaoTotal"/>
            {!showChartManifestsReceivedSentFromTheGeneratorAndAT &&
                <GraficoBarraDupla 
                    title="Minha movimentação total para o destinador final"
                    subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                    ]))}
                    dataChart={agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                    ])}
                />}

        
            {!showListManifestsReceivedSentFromTheGeneratorAndAT &&
                (!!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo).length ||
                !!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo).length) &&
                    <ListaDeMtrs
                        title="Manifestos recebidos pelo destinador final"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={[
                            ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo),
                            ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                        ]}
                        authorization={token || ""} 
                        options={["Gerador", "Destinador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]}
                    />
            }

            {!showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT &&
                (!!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo).length &&
                 !!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo).length) &&
                    <>
                        <TabelaDemonstrativaCompleta
                            title="Detalhes de origem dos resíduos enviados para o destinador final"
                            periodo={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                            listaAgrupadaPorDestinadorEGerador={agruparPorGeradorEDestinador([...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo),
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo)])}
                        />

                    </>
            }

            
            {!showTableManifestsReceivedSentFromTheGeneratorAndAT &&
                (!!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo).length ||
                !!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo).length) &&
                    <>
                        <TabelaDemonstrativaSimples 
                            tipo="Destinador"
                            title="Detalhes de destinação dos resíduos enviados para o destinador final"
                            periodo={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                            listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador([
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                            ])}
                        />
                    </>
            }

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowChartManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico   */}
                    Gráfico <span className="material-icons">leaderboard</span>                   
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowListManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                {
                    !showListManifestsReceivedSentFromTheGeneratorAndAT &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            onClick={()=> generatePdfListaMtrsPorDestinadorDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`, 
                                "MANIFESTOS RECEBIDOS PELO DESTINADOR FINAL", 
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`, 
                                agruparPorDestinador([
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo),
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                            ]))}
                            disableButton={showListManifestsReceivedSentFromTheGeneratorAndAT}
                            setDisableButton={()=> {}}
                        >
                            {/* <Download /> Baixar */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }
                <SwitchButton
                    disableButton={!showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    {/* <Sheet className="w-4 h-4 text-white"/> Detalhes da origem */}
                    Detalhes da origem <span className="material-icons">feed</span>
                </SwitchButton>
                {
                    !showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT}
                            setDisableButton={()=> {}}
                            onClick={()=> {
                                const preparedData = prepareDataForPdf(agruparPorGerador([
                                    ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                                    ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                                ]), "Gerador")
                                generatePdfTableDestinacao(
                                    preparedData, 
                                    `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                    "Detalhes de origem dos residuos enviados para o destinador final",
                                    `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                    "GERADOR"
                                )
                            }}
                        >
                            {/* <Download /> Baixar PDF */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }
                <SwitchButton
                    disableButton={!showTableManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowTableManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    {/* <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação */}
                    Detalhes da destinação<span className="material-icons">feed</span>
                </SwitchButton>
                {
                    !showTableManifestsReceivedSentFromTheGeneratorAndAT &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={showTableManifestsReceivedSentFromTheGeneratorAndAT}
                            setDisableButton={()=> {}}
                            onClick={()=> {
                                const preparedData = prepareDataForPdf(agruparPorDestinador([
                                    ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                                    ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                                ]), "Destinador")
                                generatePdfTableDestinacao(
                                    preparedData, 
                                    `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                    "Detalhes de destinacao dos residuos enviados para o destinador final",
                                    `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                    "DESTINADOR"
                                )
                            }}
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