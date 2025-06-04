import type { MTRCompleteResponseI, MTRResponseI } from "@/interfaces/mtr.interface"
import api from "@/services/api"

type profile = "Gerador" | "Armazenador Temporário" | "Destinador"
type situacao = "Todos" | "Abertos" | "Com CDF" | "Sem CDF"

type filterBySituation = "Salvo" | "Armaz Temporário - Recebido" | "Armaz Temporário" | "Cancelado" | "Recebido"
type listFilterBySituations = filterBySituation[]

export async function getMtrList(profile :profile, dateFrom :string, dateTo :string, authorization :string, statusManifesto :situacao, operatingUnit? :number, listFilterBySituations? :listFilterBySituations) {
    const profileNumber = {
        "Gerador": 8,
        "Armazenador Temporário": 10,
        "Destinador": 9
    } as const

    const situacaoManifestos = {
        "Todos": 0,
        "Abertos": 1,
        "Com CDF": 2,
        "Sem CDF": 3
    } as const

    if(!operatingUnit) { throw new Error("Código da unidade inválido") }
    
    const { data } :MTRCompleteResponseI = await api.get(`/api/mtr/pesquisaMtr/${operatingUnit}/0/18/${profileNumber[profile]}/${dateFrom}/${dateTo}/${situacaoManifestos[statusManifesto]}/all?size=99999&first=0`, {
        headers: {
            Authorization: `Bearer ${authorization}`
        }
    })

    if(!data.objetoResposta.length && !data.erro) { 
        return data.objetoResposta as MTRResponseI[]
    }
    if(data.erro) { throw new Error(data.mensagem?.toString() || "Ocorreu um erro durante a busca.") }

    if(!listFilterBySituations?.length) { 
        return data.objetoResposta as MTRResponseI[] 
    }

    return (data.objetoResposta as MTRResponseI[])
        .filter(mtr => {
            return listFilterBySituations.includes(mtr.situacaoManifesto.simDescricao as filterBySituation)
        })
}