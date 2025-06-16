import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { agruparPorTipoDeResiduo, type GroupByWasteTypeOutput, type MTRsByMonth, type TotaisMensais } from "@/utils/fnFilters";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { obterMesAtual } from "@/utils/fnUtils";

interface GraficoProps {
    title :string
    subTitle? :string
    acumulated? :number
    dataChart? :TotaisMensais[]
    dataMTRs? :MTRsByMonth
    setMesSelecionado :Dispatch<SetStateAction<string | undefined>>
    setDataResiduos :Dispatch<SetStateAction<GroupByWasteTypeOutput[] | undefined>>
}

export default function GraficoAnualBarras({ dataChart, dataMTRs, title, subTitle, acumulated, setDataResiduos, setMesSelecionado } :GraficoProps) {

    const chartRef = useRef<HTMLDivElement>(null)

    const handleSetDataResiduos = (data :GroupByWasteTypeOutput[], mes :string) => {
        setDataResiduos(data)
        setMesSelecionado(mes)
    }

    const chartConfig = {
        quantidadeRecebida: {
            label: "Quantidade Recebida",
            color: "#00695C",
        }
    } satisfies ChartConfig

    useEffect(()=> {
        setTimeout(() => {
            if(chartRef.current) {
                chartRef.current.classList.remove("opacity-0")
                chartRef.current.classList.add("opacity-100")
            }
        }, 100)
    }, [])

    useEffect(()=> {
        if(dataMTRs && dataChart && Object.keys(dataMTRs).length > 0 && Object.keys(dataChart).length > 0) {
            const mes :string | undefined = dataChart.find((_, index)=> {
                        return index === dataChart.length - 1
                    })?.mes
            if(mes) {
                handleSetDataResiduos(agruparPorTipoDeResiduo(dataMTRs[mes]), mes)
            }
        }
    }, [subTitle])

    return(
    <Card ref={chartRef} className="w-full md:w-[100%] max-w-full justify-self-center opacity-0 transition-opacity duration-1000">
        <CardHeader>
        <div className="flex flex-col gap-2 items-center justify-center">
            <CardTitle className="text-lg text-center sm:text-xl text-gray-800">
                {title}
            </CardTitle>
            {
            subTitle &&
                <CardTitle className="font-light">{`Período: ${subTitle}`}</CardTitle>
            }
            <CardTitle>{`Total acumulado: ${acumulated?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} <span className="text-xs">T</span></CardTitle>
        </div>
        </CardHeader>
        <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
            
            <BarChart 
                data={dataChart}
                margin={{
                    top:20,
                    bottom: 0,
                    left: 0,
                    right: 0
                }}
            >
                <CartesianGrid vertical={false}/>
                <XAxis
                    className="select-none"
                    dataKey="mes"
                    tickLine={false}
                    tickMargin={20}
                    fontSize={12}
                    axisLine={false}
                    tickFormatter={(value)=> {
                        return value === obterMesAtual() ? `${value} (Em andamento)` : value
                    }}
                />

                <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value)=>`${value} TON`}
                />

                <ChartTooltip content={<ChartTooltipContent/>}/>
                <ChartLegend content={<ChartLegendContent/>}/>
                <CartesianGrid vertical={false}/>

                <Bar
                    dataKey="quantidadeRecebida"
                    name="Quantidade Recebida"
                    fill={"var(--color-quantidadeRecebida)"}
                    radius={[4, 4, 0, 0]}
                    barSize={80}
                    fontSize={10}
                    className="cursor-pointer"
                >
                    <LabelList
                        dataKey="quantidadeRecebida"
                        position="top" // Posição do rótulo (pode ser "top", "inside", "bottom", etc.)
                        formatter={(value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} // Formato do valor
                        fill="#000"
                        fontSize={10}
                    />
                    {dataChart?.map((entry :TotaisMensais, index) => (
                        <Cell
                            key={`cell-${index}`} 
                            fill={(entry.mes === obterMesAtual()) ? chartConfig.quantidadeRecebida.color.concat("50") : chartConfig.quantidadeRecebida.color} 
                            onClick={()=> handleSetDataResiduos(agruparPorTipoDeResiduo(dataMTRs?.[entry.mes] ?? []), entry.mes)}
                        />
                    ))}
                </Bar>
            </BarChart>

        </ChartContainer>
        </CardContent>
    </Card>
    )
}