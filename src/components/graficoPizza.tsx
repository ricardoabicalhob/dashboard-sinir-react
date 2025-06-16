import { Cell, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { GroupByWasteTypeOutput } from "@/utils/fnFilters"
import { useMemo } from "react"

export const description = "A pie chart with a legend"

interface GraficoPizzaProps {
    dataChart : GroupByWasteTypeOutput[]
    mesSelecionado :string
    titulo :string
}

const colorPalette = [
  "#00695C", // Um verde escuro
  "#FFC107", // Um amarelo vibrante
  "#2196F3", // Um azul claro
  "#F44336", // Um vermelho
  "#9C27B0", // Um roxo
  "#FF9800", // Um laranja
  "#4CAF50", // Outro verde
  "#795548", // Marrom
  "#607D8B", // Azul acinzentado
  "#E91E63", // Rosa
];

const getcolorsForResiduo = (index :number) => {
    return colorPalette[index % colorPalette.length]
}

export function GraficoPizza({ dataChart, mesSelecionado, titulo } :GraficoPizzaProps) {

    const chartConfig :ChartConfig = useMemo(()=> {
        const dynamicConfig :ChartConfig = {}
        dataChart.forEach((entry, index)=> {
            dynamicConfig[entry.resDescricao] = {
                label: entry.resDescricao,
                color: getcolorsForResiduo(index)
            }
        })
        return dynamicConfig
    }, [dataChart])

    if(dataChart.length === 0) {
        return(
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-lg sm:text-xl">{titulo}</CardTitle>
                    <CardDescription>{mesSelecionado}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex">
                        <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
                            <span className="material-symbols-outlined text-gray-300 text-6xl">donut_small</span>
                            <span className="text-gray-500 text-center font-light text-sm">Para visualizar clique nas barras do gráfico de destinação total de resíduos por mês</span>
                        </div>
                </CardContent>
            </Card>
        )    
    }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg sm:text-xl">{titulo}</CardTitle>
        <CardDescription>{mesSelecionado}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-end py-0 justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-fit min-h-[371px] max-h-[400px] flex-1"
        >
          <PieChart>
            <Pie 
                data={dataChart} 
                dataKey="quantidadeRecebida" 
                nameKey="resDescricao"
                innerRadius={50}
                outerRadius={80}
                labelLine={false}
                label={({ payload, ...props }) => {
                    return (
                    <text
                        cx={props.cx}
                        cy={props.cy}
                        x={props.x}
                        y={props.y}
                        textAnchor={props.textAnchor}
                        dominantBaseline={props.dominantBaseline}
                        fill="#000"
                    >
                        {payload.quantidadeRecebida.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})}
                    </text>
                )
              }}
            >
                {
                    dataChart.map((_, index)=> (
                        <Cell key={`cell-${index}`} fill={getcolorsForResiduo(index)} />
                    ))
                }
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="resDescricao"/>}
              className="items-start -translate-y-2 flex-col gap-2 mt-4 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}