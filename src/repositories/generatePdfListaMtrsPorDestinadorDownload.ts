import type { MTRResponseI } from "@/interfaces/mtr.interface"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export default function generatePdfListaMtrsPorDestinadorDownload(unidade :string, title :string, periodo :string, listMtrs :MTRResponseI[][]) {
    
    const doc = new jsPDF('landscape', 'pt', 'a4')
    let startY = 25
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFontSize(16)

    doc.setFont("helvetica", "", "bold")
    const unidadeTitleWidth = doc.getTextWidth(unidade)
    const unidadeTitleX = (pageWidth - unidadeTitleWidth) / 2
    doc.text(unidade.toUpperCase(), unidadeTitleX, startY)
    startY += 25

    doc.setFont("helvetica", "", "normal")
    doc.setFontSize(12)
    const mainTitleWidth = doc.getTextWidth(title)
    const mainTitleX = (pageWidth - mainTitleWidth) / 2
    doc.text(title.toUpperCase(), mainTitleX, startY)
    startY += 15

    doc.setFontSize(12)
    const periodoTitleWidth = doc.getTextWidth(`Período: ${periodo}`)
    const periodoTitleX = (pageWidth - periodoTitleWidth) / 2
    doc.text(`Período: ${periodo}`, periodoTitleX, startY + 5)
    startY += 25

    listMtrs.forEach((destinador, index) => {
        if(destinador.length > 0) {
            if(index > 0) {
                doc.addPage()
                startY = 25
            }

            const primeiroMtr = destinador[0]
            const destinadorNome = `${primeiroMtr.parceiroDestinador.parCodigo} - ${primeiroMtr.parceiroDestinador.parDescricao.toUpperCase()}`

            doc.setFontSize(12)
            // const destinadorTitleWidth = doc.getTextWidth(`Destinador: ${destinadorNome}     (${destinador.length} manifestos)`)
            const destinadorTitleX = 40
            doc.text(`DESTINADOR: ${destinadorNome.toUpperCase()}     (${destinador.length} manifestos)`, destinadorTitleX, startY + 5)
            startY += 10

            const colunas = ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]
            const linhas = destinador.map(mtr => [
                mtr.manNumero,
                new Date(mtr.manData).toLocaleDateString("pt-BR"),
                mtr.parceiroGerador.parDescricao.toUpperCase(),
                `${mtr.listaManifestoResiduo[0].residuo.resCodigoIbama} - ${mtr.listaManifestoResiduo[0].residuo.resDescricao}`,
                mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                mtr.listaManifestoResiduo[0].marQuantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                mtr.situacaoManifesto.simDataRecebimento
            ])

            autoTable(doc, {
                headStyles: {
                  fillColor: "#00695C",
                },
                head: [colunas],
                body: linhas,
                startY: startY,
            })

        }
    })

    doc.save(`${unidade} - ${title}.pdf`);
}