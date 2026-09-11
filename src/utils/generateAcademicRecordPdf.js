import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BIMESTER_LABELS = {
  1: 'PRIMER BIMESTRE',
  2: 'SEGUNDO BIMESTRE',
  3: 'TERCER BIMESTRE',
  4: 'CUARTO BIMESTRE',
}

const GRADE_WORDS = {
  1: 'PRIMERO',
  2: 'SEGUNDO',
  3: 'TERCERO',
  4: 'CUARTO',
  5: 'QUINTO',
  6: 'SEXTO',
}

const LINE = [80, 80, 80]
const HEAD_FILL = [236, 236, 236]
const LABEL_FILL = [248, 248, 248]

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function siagiePersonName(person) {
  if (!person) return ''
  const surnames = [person.surname_father, person.surname_mother]
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .join(' ')
  const names = String(person.given_name || person.name || '').trim()
  if (surnames && names) return `${surnames}, ${names}`.toUpperCase()
  return (surnames || names || '').toUpperCase()
}

function gradeWord(grade) {
  const key = String(grade ?? '').trim()
  return GRADE_WORDS[key] || GRADE_WORDS[Number(key)] || key.toUpperCase()
}

function scoreText(entry) {
  const value = entry?.score
  return value && String(value).trim() ? String(value).trim() : ''
}

function observationText(entry) {
  const value = entry?.observations
  return value && String(value).trim() ? String(value).trim() : ''
}

function isTransversalCourse(course) {
  const name = String(course?.course_name || '').toLowerCase()
  return name.includes('tutor') || name.includes('transversal')
}

function attendanceDash(value) {
  if (value === null || value === undefined || Number(value) === 0) return '-'
  return String(value)
}

/** jsPDF 4 deja sucio el word-spacing (Tw) y aplasta los espacios. */
function resetWordSpacing(doc) {
  try {
    doc.internal.write('0 Tw')
  } catch {
    /* ignore */
  }
}

function drawText(doc, text, x, y, options) {
  resetWordSpacing(doc)
  const value = String(text ?? '')
  if (options) {
    doc.text(value, x, y, { charSpace: 0, ...options })
  } else {
    doc.text(value, x, y, { charSpace: 0 })
  }
}

function measureLabel(doc, text, size = 6.5) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(size)
  const raw = String(text || '')
  const spaces = (raw.match(/ /g) || []).length
  const spaceMm = spaces * size * 0.1
  return doc.getTextWidth(raw) + spaceMm + 3.2
}

function drawInfoRow(doc, y, left, usable, cells, rowH = 6.2) {
  const label0 = Math.min(58, Math.max(22, measureLabel(doc, cells[0]?.text, cells[0]?.size)))
  const label2 = cells[2] ? Math.min(42, Math.max(18, measureLabel(doc, cells[2].text, cells[2].size))) : 0
  const rest = usable - label0 - label2
  const valueW = cells[2] ? rest / 2 : rest
  const colW = [label0, valueW, label2, valueW]
  let x = left
  cells.forEach((cell, i) => {
    const w = colW[i]
    if (!w) return
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.15)
    if (cell.fill) {
      doc.setFillColor(...LABEL_FILL)
      doc.rect(x, y, w, rowH, 'FD')
    } else {
      doc.rect(x, y, w, rowH, 'S')
    }
    doc.setFont('helvetica', cell.bold ? 'bold' : 'normal')
    doc.setFontSize(cell.size || 6.5)
    doc.setTextColor(20, 20, 20)
    drawText(doc, cell.text || '', x + 1.4, y + 4)
    x += w
  })
  return y + rowH
}

function drawCenteredTitle(doc, text, y, left, right) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20, 20, 20)
  drawText(doc, text, (left + right) / 2, y, { align: 'center' })
}

/**
 * Libreta SIAGIE: A4 vertical, escudos, ficha del alumno, 4 bimestres
 * (NL + conclusión), competencias transversales, asistencia y firmas.
 */
export async function generateAcademicRecordPdf(payload) {
  const {
    student = {},
    period = {},
    bimesters = [],
    courses = [],
    institution = {},
    attendance = [],
  } = payload || {}

  const [mineduLogo, schoolLogo] = await Promise.all([
    loadImage('/img/siagie-header-1.png'),
    loadImage('/img/logo_rp.png'),
  ])

  const imageDataUrl = (img) => {
    if (!img) return null
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    return canvas.toDataURL('image/png')
  }
  const mineduData = imageDataUrl(mineduLogo)
  const schoolData = imageDataUrl(schoolLogo)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const left = 8
  const right = pageWidth - 8
  const usable = right - left
  const year = period.year || period.name || ''

  const orderedBimesters = [1, 2, 3, 4].map((number) => {
    const found = bimesters.find((b) => Number(b.number) === number)
    return found || { number, name: BIMESTER_LABELS[number] }
  })

  const studentSiagieName = siagiePersonName({
    given_name: student.given_name,
    name: student.given_name ? student.given_name : student.name,
    surname_father: student.surname_father,
    surname_mother: student.surname_mother,
  }) || String(student.name || '').toUpperCase()

  const tutorSiagieName = siagiePersonName(student.tutor) || String(student.tutor_name || '').toUpperCase()

  const curricular = courses.filter((c) => !isTransversalCourse(c))
  const transversal = courses.filter((c) => isTransversalCourse(c))

  const drawPageChrome = (page, totalPages) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(40, 40, 40)
    drawText(doc, `Página ${page} de ${totalPages}`, right, 8, { align: 'right' })

    if (page === 1) {
      if (mineduData) {
        doc.addImage(mineduData, 'PNG', left, 7, 22, 18)
      } else {
        doc.setFontSize(6)
        drawText(doc, 'MINISTERIO DE EDUCACIÓN', left, 16)
      }

      if (schoolData) {
        doc.addImage(schoolData, 'PNG', right - 18, 6, 16, 20)
      }

      drawCenteredTitle(doc, `- ${year} -`, 18, left, right)
    }
  }

  let y = 29

  const infoRows = [
    [
      { text: 'DRE:', fill: true, bold: true, size: 6.5 },
      { text: institution.dre || '' },
      { text: 'UGEL:', fill: true, bold: true, size: 6.5 },
      { text: institution.ugel || '' },
    ],
    [
      { text: 'Nivel:', fill: true, bold: true, size: 6.5 },
      { text: institution.level || 'Secundaria' },
      { text: 'Código Modular:', fill: true, bold: true, size: 6.5 },
      { text: institution.modular_code || '' },
    ],
  ]

  infoRows.forEach((row) => {
    y = drawInfoRow(doc, y, left, usable, row)
  })

  const drawWide = (label, value, rowH = 6.2) => {
    const wideLabel = Math.min(usable * 0.52, Math.max(58, measureLabel(doc, label)))
    const wideValue = usable - wideLabel
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.15)
    doc.setFillColor(...LABEL_FILL)
    doc.rect(left, y, wideLabel, rowH, 'FD')
    doc.rect(left + wideLabel, y, wideValue, rowH, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    drawText(doc, label, left + 1.4, y + 4)
    doc.setFont('helvetica', 'normal')
    drawText(doc, value || '', left + wideLabel + 1.4, y + 4)
    y += rowH
  }

  drawWide('Institución educativa:', institution.name || '')
  y = drawInfoRow(doc, y, left, usable, [
    { text: 'Grado:', fill: true, bold: true, size: 6.5 },
    { text: gradeWord(student.grade || student.grade_section?.grade) },
    { text: 'Sección:', fill: true, bold: true, size: 6.5 },
    { text: String(student.section || student.grade_section?.section || '').toUpperCase() },
  ])
  drawWide('Apellidos y nombres del estudiante:', studentSiagieName)
  y = drawInfoRow(doc, y, left, usable, [
    { text: 'Código del estudiante:', fill: true, bold: true, size: 6 },
    { text: student.student_code || '' },
    { text: 'DNI:', fill: true, bold: true, size: 6.5 },
    { text: student.dni || '' },
  ])
  drawWide('Apellidos y nombres del docente o tutor:', tutorSiagieName)

  const headTop = [
    [
      { content: 'Área curricular', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Competencias', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      ...orderedBimesters.map((b) => ({
        content: BIMESTER_LABELS[b.number],
        colSpan: 2,
        styles: { halign: 'center', fontStyle: 'bold' },
      })),
      {
        content: 'NL alcanzado\nal finalizar el\nperíodo lectivo',
        rowSpan: 2,
        styles: { valign: 'middle', halign: 'center', fontSize: 5.5 },
      },
    ],
    orderedBimesters.flatMap(() => [
      { content: 'NL', styles: { halign: 'center' } },
      { content: 'Conclusión descriptiva', styles: { halign: 'center' } },
    ]),
  ]

  const buildCourseRows = (courseList, includeArea = true) => {
    const body = []
    courseList.forEach((course) => {
      const comps = course.competencies || []
      if (!comps.length) {
        const row = []
        if (includeArea) {
          row.push({
            content: String(course.course_name || '').toUpperCase(),
            styles: { fontStyle: 'bold', fontSize: 6, valign: 'middle', halign: 'center' },
          })
        }
        row.push({ content: '', colSpan: includeArea ? 1 + orderedBimesters.length * 2 + 1 : orderedBimesters.length * 2 + 1 })
        body.push(row)
        return
      }

      comps.forEach((comp, index) => {
        const by = comp.scores_by_bimester || {}
        const row = []
        if (includeArea && index === 0) {
          row.push({
            content: String(course.course_name || '').toUpperCase(),
            rowSpan: comps.length,
            styles: { fontStyle: 'bold', fontSize: 6, valign: 'middle', halign: 'center' },
          })
        }
        row.push({
          content: comp.competency_name || '',
          styles: { fontSize: 6 },
        })
        orderedBimesters.forEach((b) => {
          const entry = by[String(b.number)] || by[b.number]
          row.push({
            content: scoreText(entry),
            styles: { halign: 'center', fontStyle: 'bold', fontSize: 7.5, valign: 'middle' },
          })
          row.push({
            content: observationText(entry),
            styles: { fontSize: 5.4, valign: 'middle' },
          })
        })
        row.push({
          content: scoreText({ score: comp.final_score }),
          styles: { halign: 'center', fontStyle: 'bold', fontSize: 7.5, valign: 'middle' },
        })
        body.push(row)
      })
    })
    return body
  }

  const tableStyles = {
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 6,
      cellPadding: 0.8,
      overflow: 'linebreak',
      valign: 'top',
      lineColor: LINE,
      lineWidth: 0.15,
      textColor: [20, 20, 20],
    },
    headStyles: {
      fillColor: HEAD_FILL,
      textColor: [20, 20, 20],
      fontStyle: 'bold',
      fontSize: 5.6,
      valign: 'middle',
    },
    margin: { left, right: 8, top: 12 },
    tableWidth: usable,
    willDrawCell: () => resetWordSpacing(doc),
    didDrawPage: () => resetWordSpacing(doc),
  }

  autoTable(doc, {
    ...tableStyles,
    startY: y + 2,
    head: headTop,
    body: buildCourseRows(curricular, true),
    columnStyles: includeAreaStyles(true),
  })

  y = doc.lastAutoTable.finalY + 4

  const transversalHead = [
    [
      {
        content: 'Competencias transversales/No asociada(s) a área(s)',
        rowSpan: 2,
        styles: { valign: 'middle', halign: 'center', fontSize: 5.6 },
      },
      ...orderedBimesters.map((b) => ({
        content: BIMESTER_LABELS[b.number],
        colSpan: 2,
        styles: { halign: 'center', fontStyle: 'bold' },
      })),
      {
        content: 'NL alcanzado\nal finalizar el\nperíodo lectivo',
        rowSpan: 2,
        styles: { valign: 'middle', halign: 'center', fontSize: 5.5 },
      },
    ],
    orderedBimesters.flatMap(() => [
      { content: 'NL', styles: { halign: 'center' } },
      { content: 'Conclusión descriptiva', styles: { halign: 'center' } },
    ]),
  ]

  const transversalBody = transversal.length
    ? buildCourseRows(transversal, false)
    : [
        transversalEmptyRow('Se desenvuelve en entornos virtuales generados por las TIC', orderedBimesters),
        transversalEmptyRow('Gestiona su Aprendizaje de manera autónoma', orderedBimesters),
      ]

  if (y > pageHeight - 70) {
    doc.addPage()
    y = 14
  }

  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: transversalHead,
    body: transversalBody,
    columnStyles: includeAreaStyles(false),
  })

  y = doc.lastAutoTable.finalY + 5

  if (y > pageHeight - 110) {
    doc.addPage()
    y = 14
  }

  doc.setDrawColor(...LINE)
  doc.setFillColor(...HEAD_FILL)
  doc.rect(left, y, usable, 5.2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  drawText(doc, 'Comentario General', left + usable / 2, y + 3.5, { align: 'center' })
  y += 5.2
  doc.rect(left, y, usable, 12, 'S')
  y += 16

  const attByNumber = new Map((attendance || []).map((a) => [Number(a.number), a]))
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    margin: { left, right: 8 },
    tableWidth: usable,
    styles: {
      fontSize: 6.5,
      cellPadding: 1.1,
      halign: 'center',
      valign: 'middle',
      lineColor: LINE,
      lineWidth: 0.15,
    },
    willDrawCell: () => resetWordSpacing(doc),
    headStyles: { fillColor: HEAD_FILL, textColor: [20, 20, 20], fontStyle: 'bold', fontSize: 6.5 },
    head: [
      [
        { content: 'Período', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'Inasistencia', colSpan: 2 },
        { content: 'Tardanzas', colSpan: 2 },
      ],
      ['Justificadas', 'Injustificadas', 'Justificadas', 'Injustificadas'],
    ],
    body: [1, 2, 3, 4].map((number) => {
      const row = attByNumber.get(number) || {}
      return [
        `B${number}`,
        attendanceDash(row.absences_justified),
        attendanceDash(row.absences_unjustified),
        attendanceDash(row.tardiness_justified),
        attendanceDash(row.tardiness_unjustified),
      ]
    }),
  })

  y = doc.lastAutoTable.finalY + 5
  const sitLabelW = 70
  doc.setFillColor(...HEAD_FILL)
  doc.rect(left, y, sitLabelW, 7, 'FD')
  doc.rect(left + sitLabelW, y, usable - sitLabelW, 7, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  drawText(doc, 'Situación al finalizar el período lectivo', left + sitLabelW / 2, y + 4.6, { align: 'center' })
  y += 34

  const signW = 70
  doc.setDrawColor(...LINE)
  doc.line(left + 10, y, left + 10 + signW, y)
  doc.line(right - 10 - signW, y, right - 10, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  drawText(doc, 'Firma del Docente o Tutor(a)', left + 10 + signW / 2, y + 4, { align: 'center' })
  drawText(doc, 'Firma y sello del Director(a)', right - 10 - signW / 2, y + 4, { align: 'center' })
  y += 14

  const issued = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.setFontSize(7)
  drawText(doc, `Fecha de Emisión: ${issued}`, pageWidth / 2, y, { align: 'center' })
  y += 4
  drawText(doc, `Versión del SIAGIE: ${year || new Date().getFullYear()}.1`, pageWidth / 2, y, { align: 'center' })

  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    drawPageChrome(page, totalPages)
  }

  const safeName = (studentSiagieName || 'estudiante')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  doc.save(`libreta-notas-${safeName}-${year || ''}.pdf`)
}

function includeAreaStyles(withArea) {
  if (withArea) {
    return {
      0: { cellWidth: 22 },
      1: { cellWidth: 36 },
      2: { cellWidth: 8 },
      3: { cellWidth: 22 },
      4: { cellWidth: 8 },
      5: { cellWidth: 22 },
      6: { cellWidth: 8 },
      7: { cellWidth: 22 },
      8: { cellWidth: 8 },
      9: { cellWidth: 22 },
      10: { cellWidth: 16 },
    }
  }

  return {
    0: { cellWidth: 58 },
    1: { cellWidth: 8 },
    2: { cellWidth: 22 },
    3: { cellWidth: 8 },
    4: { cellWidth: 22 },
    5: { cellWidth: 8 },
    6: { cellWidth: 22 },
    7: { cellWidth: 8 },
    8: { cellWidth: 22 },
    9: { cellWidth: 16 },
  }
}

function transversalEmptyRow(name, orderedBimesters) {
  return [
    { content: name, styles: { fontSize: 6 } },
    ...orderedBimesters.flatMap(() => [
      { content: '', styles: { halign: 'center' } },
      { content: '' },
    ]),
    { content: '', styles: { halign: 'center' } },
  ]
}
