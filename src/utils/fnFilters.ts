import type { MTRResponseI } from "@/interfaces/mtr.interface";
import { verificarDataEstaDentroDoPeriodo, formatarDataDDMMYYYYParaMMDDYYYY, ordenarMesesDeTotaisMensais } from "./fnUtils";
import type { ParceiroResponseI } from "@/interfaces/login.interface";

interface WasteQuantities {
    quantidadeIndicadaNoMTR: number
    quantidadeRecebida: number
}

interface GroupByWasteType {
    [codigoIbama :string] :WasteQuantities
}

export interface GroupByWasteTypeOutput {
    resDescricao :string
    quantidadeIndicadaNoMTR :number
    quantidadeRecebida :number
}

export function agruparPorTipoDeResiduo(listMtrs :MTRResponseI[]) :GroupByWasteTypeOutput[] {
    const quantidadesPorCodigoIbama = listMtrs.reduce((acumulador :GroupByWasteType, mtr) => {
            mtr.listaManifestoResiduo.forEach(residuo => {
                const resDescricao = residuo.residuo.resCodigoIbama + " - " + residuo.residuo.resDescricao
                const quantidadeIndicadaNoMTR = residuo.marQuantidade
                const quantidadeRecebida = residuo.marQuantidadeRecebida

                if (!acumulador[resDescricao]) {
                    acumulador[resDescricao] = { quantidadeIndicadaNoMTR: 0, quantidadeRecebida: 0 };
                }

                acumulador[resDescricao].quantidadeIndicadaNoMTR += quantidadeIndicadaNoMTR;
                acumulador[resDescricao].quantidadeRecebida += quantidadeRecebida;
            })
            return acumulador
        }, {})

    return Object.entries(quantidadesPorCodigoIbama).map(([resDescricao, quantidades ]) => ({
        resDescricao: resDescricao,
        quantidadeIndicadaNoMTR: quantidades.quantidadeIndicadaNoMTR,
        quantidadeRecebida: quantidades.quantidadeRecebida
    }))
}

export function agruparPorDestinador(listMtrs: MTRResponseI[]): MTRResponseI[][] {
    const groupedByDestinador: { [cnpj: string]: MTRResponseI[] } = {};
  
    listMtrs.forEach((mtr) => {
      const cnpjDestinador = mtr.parceiroDestinador.parCnpj;
  
      if (!groupedByDestinador[cnpjDestinador]) {
        groupedByDestinador[cnpjDestinador] = [mtr]; // Inicializa um array com o primeiro MTR para este destinador
      } else {
        groupedByDestinador[cnpjDestinador].push(mtr); // Adiciona o MTR ao array existente para este destinador
      }
    });
  
    return Object.values(groupedByDestinador);
}

export function agruparPorGeradorEDestinador(listMtrs :MTRResponseI[]): MTRResponseI[][][] {
    const groupedByGeradorEDestinador = agruparPorDestinador(listMtrs).map(destinador => {
        return agruparPorGerador(destinador)
    })
    return groupedByGeradorEDestinador
}

export function agruparPorGerador(listMtrs: MTRResponseI[]): MTRResponseI[][] {
    const grupos: { [key: string]: MTRResponseI[] } = {};

    for (const mtr of listMtrs) {
        const nomeGerador = mtr.parceiroGerador.parDescricao;
        if (!grupos[nomeGerador]) {
            grupos[nomeGerador] = [];
        }
        grupos[nomeGerador].push(mtr);
    }

    return Object.values(grupos);
}

export interface MTRsByMonth {
    [key :string] :MTRResponseI[]
}

export function agruparPorMesDeRecebimento(listMtrs :MTRResponseI[]) :MTRsByMonth{
    const dadosAgrupados :MTRsByMonth = {}
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    listMtrs.forEach(mtr => {
        if(mtr.situacaoManifesto && mtr.situacaoManifesto.simDataRecebimento) {
            const dataRecebimentoString = mtr.situacaoManifesto.simDataRecebimento

            const dataRecebimento = new Date(formatarDataDDMMYYYYParaMMDDYYYY(dataRecebimentoString) ?? "")
            if(isNaN(dataRecebimento.getTime())) {
                return
            }

            const mes = dataRecebimento.getMonth()
            const ano = dataRecebimento.getFullYear()

            // const mesFormatado = mes < 10 ? `0${mes}` : `${mes}`
            const mesFormatado = meses[mes]
            const grupoKey = `${mesFormatado}/${ano}`

            if(!dadosAgrupados[grupoKey]) {
                dadosAgrupados[grupoKey] = []
            }

            dadosAgrupados[grupoKey].push(mtr)
        } else {
            // console.warn(`MTR ${mtr.manNumero} não possui 'simDataRecebimento'. Ele será ignorado no agrupamento por mês.`)
        }
    })
    return dadosAgrupados
}

export interface TotaisMensais {
    mes :string
    quantidadeRecebida :number
}

export function totalizarPorMesDeRecebimento(listMtrsAgrupadosPorMes :MTRsByMonth) :TotaisMensais[]{
    const totaisMensais :TotaisMensais[] = []

    for(const mesAno in listMtrsAgrupadosPorMes) {
        if(Object.prototype.hasOwnProperty.call(listMtrsAgrupadosPorMes, mesAno)) {
            const mtrsDesteMes = listMtrsAgrupadosPorMes[mesAno]
            let total = 0

            mtrsDesteMes.forEach(mtr => {
                mtr.listaManifestoResiduo.forEach(residuo => {
                    if(typeof residuo.marQuantidadeRecebida === 'number' && !isNaN(residuo.marQuantidadeRecebida)) {
                        total += residuo.marQuantidadeRecebida
                    }
                })
            })

            totaisMensais.push({mes: mesAno, quantidadeRecebida: total})
        }
    }

    return ordenarMesesDeTotaisMensais(totaisMensais, "crescente")
}

export function filtrarTudoComDataDeEmissaoDentroDoPeriodo(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            if(!verificarDataEstaDentroDoPeriodo(dateFrom, dateTo, new Date(formatarDataDDMMYYYYParaMMDDYYYY(new Date(mtr.manData).toLocaleDateString()) || ""))) {
                return null
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filtrarTudoComDataDeRecebimentoDentroDoPeriodo(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            if(mtr.situacaoManifesto.simDataRecebimento && !verificarDataEstaDentroDoPeriodo(dateFrom, dateTo, new Date(formatarDataDDMMYYYYParaMMDDYYYY(mtr.situacaoManifesto.simDataRecebimento) || ""))) {
                return null
            }

            if(!mtr.situacaoManifesto.simDataRecebimento) {
                return null
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) :MTRResponseI[]{
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            if(!mtr.dataRecebimentoAT) {
                return null
            }

            if(mtr.dataRecebimentoAT && !verificarDataEstaDentroDoPeriodo(dateFrom, dateTo, new Date(formatarDataDDMMYYYYParaMMDDYYYY(mtr.dataRecebimentoAT) || ""))) {
                return null    
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(listaDeMtrsQuePossuemArmazenamentoTemporario :MTRResponseI[]) {
    const listMtrsFiltered :MTRResponseI[] = []

    listaDeMtrsQuePossuemArmazenamentoTemporario
        .map(mtr => {
            if(mtr.dataRecebimentoAT) {
                return null
            }

            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filtrarEstoqueDeArmazenamentoTemporario(listMtrs :MTRResponseI[]) {
    return listMtrs
        .filter(mtr => {
            return mtr.situacaoManifesto.simDescricao === "Armaz Temporário - Recebido"
        })
}

// export function filterEverythingWithoutAReceiptDateWithinThePeriod(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
export function filtrarTudoSemDataDeRecebimento(listMtrs :MTRResponseI[]) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            // if(mtr.situacaoManifesto.simDataRecebimento && !checkDateWithinAPeriod(dateFrom, dateTo, new Date(formatDateDDMMYYYYForMMDDYYYY(mtr.situacaoManifesto.simDataRecebimento) || ""))) {
            //     return null
            // }

            if(mtr.situacaoManifesto.simDataRecebimento) {
                return null
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filtrarTodosQuePossuemArmazenamentoTemporario(listMtrs :MTRResponseI[]) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs.map(mtr => {
        if(!!!mtr.parceiroArmazenadorTemporario.parCnpj) {
            return null
        }
        listMtrsFiltered.push(mtr)
    })
    return listMtrsFiltered
}

export function filtrarArray(str :string, arr :ParceiroResponseI[]) :ParceiroResponseI[]{
    if(!str) {
        return arr
    }

    const termoBusca = str.toLowerCase()

    const arrFiltrado = arr.filter(item => {
        const codigoParceiro = item.parCodigo.toString()
        const descricaoParceiro = item.parDescricao.toLocaleLowerCase()

        return descricaoParceiro.includes(termoBusca) || codigoParceiro.includes(termoBusca)
    })
    return arrFiltrado
}