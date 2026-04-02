import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const exportarExcel = async ({
    data = [],
    columns = [],
    fileName = 'reporte.xlsx',
    sheetName = 'Hoja1'
}) => {

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    // 🔹 columnas dinámicas
    worksheet.columns = [
        {
            header: 'N°',
            key: '__index',
            width: 10
        },
        ...columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 20
        }))
    ]



    // 🔹 estilo cabecera
    worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1f2937' }
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    })

    // 🔹 data dinámica
    data.forEach((item, index) => {
        const row = {
            __index: index + 1 // 👈 numeración
        }

        columns.forEach(col => {
            // si tiene formatter lo usa
            row[col.key] = col.formatter
                ? col.formatter(item)
                : item[col.key]
        })

        worksheet.addRow(row)
    })

    // 🔹 estilos generales
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            })
        }
    })

    // 🔹 exportar
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    saveAs(blob, fileName)
}