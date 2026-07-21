import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const applyHeaderStyle = (row) => {
    row.eachCell(cell => {
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
}

const applyBodyStyle = (row) => {
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

export const exportarExcel = async ({
    data = [],
    columns = [],
    fileName = 'reporte.xlsx',
    sheetName = 'Hoja1',
    title = null,
    metaRows = [],
    summaryRow = null
}) => {

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    let currentRow = 1

    if (title) {
        const titleRow = worksheet.addRow([title])
        worksheet.mergeCells(currentRow, 1, currentRow, columns.length + 1)
        titleRow.getCell(1).font = { bold: true, size: 14 }
        titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
        currentRow += 1
    }

    metaRows.forEach((metaRow) => {
        const row = worksheet.addRow(metaRow)
        row.getCell(1).font = { bold: true }
        row.eachCell(cell => {
            cell.alignment = { vertical: 'middle', horizontal: 'left' }
        })
        currentRow += 1
    })

    if (title || metaRows.length) {
        worksheet.addRow([])
        currentRow += 1
    }

    const headerValues = [
        'N°',
        ...columns.map(col => col.header)
    ]
    const headerRow = worksheet.addRow(headerValues)
    applyHeaderStyle(headerRow)
    currentRow += 1

    worksheet.columns = [
        { key: '__index', width: 8 },
        ...columns.map(col => ({
            key: col.key,
            width: col.width || 20
        }))
    ]

    data.forEach((item, index) => {
        const rowValues = {
            __index: index + 1
        }

        columns.forEach(col => {
            rowValues[col.key] = col.formatter
                ? col.formatter(item)
                : item[col.key]
        })

        const row = worksheet.addRow(rowValues)
        applyBodyStyle(row)
        currentRow += 1
    })

    if (summaryRow) {
        worksheet.addRow([])
        currentRow += 1

        const summaryValues = {
            __index: ''
        }
        columns.forEach(col => {
            summaryValues[col.key] = summaryRow[col.key] ?? ''
        })

        const row = worksheet.addRow(summaryValues)
        row.eachCell(cell => {
            cell.font = { bold: true }
        })
        applyBodyStyle(row)
    }

    // 🔹 exportar
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    saveAs(blob, fileName)
}