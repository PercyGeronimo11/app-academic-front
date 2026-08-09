import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BIMESTER_LABELS = {
  1: 'PRIMER BIMESTRE',
  2: 'SEGUNDO BIMESTRE',
  3: 'TERCER BIMESTRE',
  4: 'CUARTO BIMESTRE',
}

function cell(value) {
  return value && String(value).trim() ? String(value).trim() : '—'
}

function scoreCell(entry) {
  return cell(entry?.score)
}

function observationCell(entry) {
  return cell(entry?.observations)
}

/**
 * Genera PDF de record académico inspirado en la libreta SIAGIE
 * (Área | Competencia | NL + conclusión por bimestre × 4 | NL final).
 */
export function generateAcademicRecordPdf(payload) {
  const {
    student = {},
    period = {},
    bimesters = [],
    courses = [],
    institution = {},
  } = payload || {}

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 8

  const orderedBimesters = [1, 2, 3, 4].map((number) => {
    const found = bimesters.find((b) => Number(b.number) === number)
    return found || { number, name: BIMESTER_LABELS[number] }
  })

  // Encabezado institucional
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Libreta de notas — ${period.year || ''}`.trim(), margin, 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  let y = 15
  const headerLines = [
    `DRE: ${institution.dre || '—'}    UGEL: ${institution.ugel || '—'}`,
    `Nivel: ${institution.level || 'Secundaria'}    Código modular: ${institution.modular_code || '—'}`,
    `Institución educativa: ${institution.name || '—'}`,
    `Grado / Sección: ${student.grade_section?.label || '—'}`,
    `Apellidos y nombres del estudiante: ${student.name || '—'}`,
    `Código del estudiante: ${student.student_code || '—'}    DNI: ${student.dni || '—'}`,
    `Apellidos y nombres del docente o tutor: ${student.tutor_name || '—'}`,
  ]
  headerLines.forEach((line) => {
    doc.text(line, margin, y)
    y += 4
  })

  const headTop = [
    [
      { content: 'Área curricular', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Competencias', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      ...orderedBimesters.map((b) => ({
        content: BIMESTER_LABELS[b.number] || b.name || `B${b.number}`,
        colSpan: 2,
        styles: { halign: 'center', fontStyle: 'bold' },
      })),
      {
        content: 'NL alcanzado al finalizar el período lectivo',
        rowSpan: 2,
        styles: { valign: 'middle', halign: 'center', fontSize: 6 },
      },
    ],
    orderedBimesters.flatMap(() => [
      { content: 'NL', styles: { halign: 'center' } },
      { content: 'Conclusión descriptiva', styles: { halign: 'center' } },
    ]),
  ]

  const body = []
  courses.forEach((course) => {
    const comps = course.competencies || []
    if (!comps.length) {
      body.push([
        { content: course.course_name || '—', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: 'Sin competencias registradas', colSpan: 1 + orderedBimesters.length * 2 + 1 },
      ])
      return
    }

    comps.forEach((comp, index) => {
      const by = comp.scores_by_bimester || {}
      const row = []
      if (index === 0) {
        row.push({
          content: course.course_name || '—',
          rowSpan: comps.length,
          styles: { fontStyle: 'bold', fontSize: 7, valign: 'middle' },
        })
      }
      row.push({
        content: `${comp.competency_number || comp.competency_code || ''} ${comp.competency_name || ''}`.trim(),
        styles: { fontSize: 6.5 },
      })
      orderedBimesters.forEach((b) => {
        const entry = by[String(b.number)] || by[b.number]
        row.push({ content: scoreCell(entry), styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } })
        row.push({ content: observationCell(entry), styles: { fontSize: 5.5 } })
      })
      row.push({
        content: cell(comp.final_score),
        styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 },
      })
      body.push(row)
    })
  })

  autoTable(doc, {
    startY: y + 2,
    head: headTop,
    body,
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1.1,
      overflow: 'linebreak',
      valign: 'top',
      lineColor: [60, 60, 60],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [20, 20, 20],
      fontStyle: 'bold',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 42 },
      10: { cellWidth: 16 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      const page = doc.internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Fecha de emisión: ${new Date().toLocaleDateString('es-PE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        margin,
        doc.internal.pageSize.getHeight() - 6
      )
      doc.text(`Página ${page}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 6, {
        align: 'right',
      })
    },
  })

  const safeName = (student.name || 'estudiante').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
  doc.save(`record-academico-${safeName}-${period.year || ''}.pdf`)
}
