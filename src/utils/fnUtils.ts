import { format } from "date-fns"
import type { GroupByWasteTypeOutput, TotaisMensais } from "./fnFilters";

export function subtrairDatasEmDias(initialDate :Date, finalDate :Date) {
    const tempoInicial = initialDate.getTime();
    const tempoFinal = finalDate.getTime();
    const diferencaEmMilissegundos = tempoFinal - tempoInicial;
    const milissegundosEmUmDia = 1000 * 60 * 60 * 24;
    return Math.floor(diferencaEmMilissegundos / milissegundosEmUmDia);
}

export function formatarDataDDMMYYYYParaMMDDYYYY(dataString: string): string | null {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = dataString.match(regex)
  
    if (!match) {
      console.error("Formato de data inválido. Esperado: dd/mm/yyyy")
      return null
    }
  
    const dia = match[1]
    const mes = match[2]
    const ano = match[3]
  
    return `${mes}/${dia}/${ano}`
  }

export function verificarDataEstaDentroDoPeriodo(referenceDateFrom :Date, referenceDateTo :Date, dateToCompare :Date) {
    
    if(dateToCompare >= referenceDateFrom && dateToCompare <= referenceDateTo) {
        return true
    }
    return false
}

export function formatarDataParaAPI (date :Date) {
    return format(date, "dd-MM-yyyy")
}

export function totalizarQuantidadeRecebida(dataToTotalize :GroupByWasteTypeOutput[]) {
    const totalReceived = dataToTotalize.reduce((acumulador, item) => {
        return acumulador += item.quantidadeRecebida
    }, 0)
    return totalReceived
}

export function totalizarQuantidadeIndicadaNoManifesto(dataToTotalize :GroupByWasteTypeOutput[]) {
    const totalEstimated = dataToTotalize.reduce((acumulador, item) => {
        return acumulador += item.quantidadeIndicadaNoMTR
    }, 0)
    return totalEstimated
}

export function separarPorMaiusculas(str: string): string {
  const spacedStr = str.replace(/(?!^)([A-Z])/g, ' $&');
  return spacedStr.split(' ').toString()
}

export function removerCaracteresNaoNumericos (value: string) {
    return value.replace(/\D/g, '')
}

export function obterMesAtual() {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    const hoje = new Date()
    const mesCorrente = hoje.getMonth()
    const anoCorrente = hoje.getFullYear()
    const mesCorrenteKey = `${meses[mesCorrente]}/${anoCorrente}`

    return mesCorrenteKey as string
}

export function ordenarMesesDeTotaisMensais(totaisMensais :TotaisMensais[], ordem :"crescente" | "decrescente") {
    const abreviacaoMesParaNumero :{ [key :string]: number } = {
        "Jan": 1, "Fev": 2, "Mar": 3, "Abr": 4, "Mai": 5, "Jun": 6,
        "Jul": 7, "Ago": 8, "Set": 9, "Out": 10, "Nov": 11, "Dez": 12
    }

    return totaisMensais.sort((a, b)=> {
        const [abreviacaoMesA] = a.mes.split("/")
        const [abreviacaoMesB] = b.mes.split("/")
        let mesesOrdenados = 0

        const numMesA = abreviacaoMesParaNumero[abreviacaoMesA]
        const numMesB = abreviacaoMesParaNumero[abreviacaoMesB]

        if(ordem === "crescente") mesesOrdenados = numMesA - numMesB
        if(ordem === "decrescente") mesesOrdenados = numMesB - numMesA

        return mesesOrdenados
    })
}