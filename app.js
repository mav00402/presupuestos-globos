// app.js - Versión completa con logo a la derecha en el PDF
// (incorpora: cabecera en negrita, espacio extra antes de la tabla, fondo cálido en la UI)

// Datos iniciales (ejemplo)
const items = [
  { id: 1, name: "Globo Latex de 12 pulgadas", price: 4500 },
  { id: 2, name: "Globo Confeti de 12 pulgadas", price: 4600 },
  { id: 3, name: "Globo Chrome de 12 pulgadas", price: 4600 },
  { id: 4, name: "Globo impreso de 12 pulgadas", price: 4600 },
  { id: 5, name: "Globo Metalizado de 18 pulgadas", price: 5600 },
  { id: 6, name: "Globo Metalizado Impreso de 18 pulgadas", price: 5700 },
  { id: 7, name: "Globo Orbz de 20 pulgadas", price: 14500 },
  { id: 8, name: "Globo Burbuja de 20 pulgadas", price: 14500 },
  { id: 9, name: "Globo Número 70cm", price: 14500 },
  { id: 10, name: "Globo Burbuja con piñata de 18 pulgadas", price: 16500 },
  { id: 11, name: "Globo Burbuja con led de 20 pulgadas", price: 18000 },
  { id: 12, name: "Globo Número 86cm", price: 18500 },
  { id: 12, name: "Globo Burbuja de 24 pulgadas", price: 20000 },
  { id: 13, name: "Globo Figura", price: 12000 },
  { id: 14, name: "Vinilo Personalizado", price: 1400 },
  { id: 15, name: "Base de 5 globos de 5 pulgadas", price: 1000 },
  { id: 16, name: "Base de 9 globos de 5 pulgadas + 1 metalizado de 23 pulgadas", price: 1500 }
];

// Estado
const currentOrder = [];
const history = [];

document.addEventListener('DOMContentLoaded', () => {
  // DOM
  const clientNameInput = document.getElementById('clientNameInput');
  const itemSelect = document.getElementById('itemSelect');
  const quantityInput = document.getElementById('quantityInput');
  const addBtn = document.getElementById('addBtn');
  const calcBtn = document.getElementById('calcBtn');
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  const printBtn = document.getElementById('printBtn');

  const currentList = document.getElementById('currentList');
  const currentEmpty = document.getElementById('currentEmpty');
  const resultArea = document.getElementById('resultArea');
  const resultClient = document.getElementById('resultClient');
  const breakdown = document.getElementById('breakdown');
  const totalAmount = document.getElementById('totalAmount');
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');

  // Cargar select
  items.forEach(it => {
    const opt = document.createElement('option');
    opt.value = String(it.id);
    opt.textContent = `${it.name} — $${it.price.toFixed(2)}`;
    itemSelect.appendChild(opt);
  });

  // Validación
  function validateQuantity() {
    const val = Number(quantityInput.value);
    const ok = Number.isInteger(val) && val > 0;
    if (!ok) quantityInput.classList.add('is-invalid'); else quantityInput.classList.remove('is-invalid');
    return ok;
  }

  // Render pedido actual
  function renderCurrent() {
    currentList.innerHTML = '';
    if (currentOrder.length === 0) {
      currentEmpty.style.display = 'block';
    } else {
      currentEmpty.style.display = 'none';
      currentOrder.forEach(line => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-start';
        li.innerHTML = `
          <div>
            <div class="fw-bold">${line.name}</div>
            <div class="small">Cantidad: ${line.qty} × $${line.unitPrice.toFixed(2)}</div>
            <div class="small text-muted">Subtotal: $${line.subtotal.toFixed(2)}</div>
          </div>
          <div class="btn-group-vertical btn-sm">
            <button class="btn btn-outline-danger btn-sm btn-remove" data-lineid="${line.lineId}" title="Eliminar línea">✕</button>
          </div>
        `;
        currentList.appendChild(li);
      });

      currentList.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const lineId = Number(btn.dataset.lineid);
          removeLine(lineId);
        });
      });
    }
  }

  // Agregar línea
  function addLine() {
    if (!validateQuantity()) return;
    const selectedId = Number(itemSelect.value);
    const item = items.find(i => i.id === selectedId);
    if (!item) {
      alert('Artículo no encontrado. Revisa el selector.');
      return;
    }
    const qty = Number(quantityInput.value);
    const subtotal = round2(item.price * qty);

    const line = {
      lineId: Date.now() + Math.floor(Math.random() * 1000),
      itemId: item.id,
      name: item.name,
      unitPrice: item.price,
      qty,
      subtotal
    };
    currentOrder.push(line);
    renderCurrent();
    quantityInput.value = 1;
  }

  // Eliminar línea
  function removeLine(lineId) {
    const idx = currentOrder.findIndex(l => l.lineId === lineId);
    if (idx >= 0) {
      currentOrder.splice(idx, 1);
      renderCurrent();
    }
  }

  // Calcular total y guardar en historial
  function calculateTotalAndSave() {
    if (currentOrder.length === 0) {
      alert('El pedido está vacío. Agregá al menos un ítem antes de calcular.');
      return;
    }

    const clientName = clientNameInput.value.trim();
    if (!clientName) {
      const ok = confirm('No ingresaste nombre del cliente. ¿Deseas continuar sin nombre?');
      if (!ok) return;
    }

    currentOrder.forEach(l => l.subtotal = round2(l.unitPrice * l.qty));
    const total = round2(currentOrder.reduce((s, l) => s + l.subtotal, 0));

    // Mostrar desglose en pantalla
    breakdown.innerHTML = '';
    currentOrder.forEach(l => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${l.name} — ${l.qty} × $${l.unitPrice.toFixed(2)} = $${l.subtotal.toFixed(2)}`;
      breakdown.appendChild(li);
    });
    totalAmount.textContent = total.toFixed(2);
    resultClient.textContent = clientName || '(Sin nombre)';
    resultArea.style.display = 'block';

    // Guardar en historial
    const historyEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      client: clientName || '',
      lines: currentOrder.map(l => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice, subtotal: l.subtotal })),
      total
    };
    history.push(historyEntry);
    renderHistory();

    // Limpiar pedido actual
    currentOrder.length = 0;
    renderCurrent();
  }

  // -------------------------
  // PDF: obtener DataURL del logo local
  async function getImageDataUrl(url) {
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error('No se pudo cargar la imagen: ' + resp.status);
      const blob = await resp.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('getImageDataUrl error:', err);
      return null;
    }
  }

  // Exportar a PDF (mejorado) — logo alineado a la derecha, cabecera en negrita,
  // y espacio extra antes de la tabla (startY aumentado)
  async function exportCurrentToPdf() {
    if (resultArea.style.display === 'none') {
      alert('Primero calculá el pedido para luego exportarlo a PDF.');
      return;
    }
    if (history.length === 0) {
      alert('No hay historial. Primero calculá y guardá un pedido.');
      return;
    }

    const last = history[history.length - 1];
    const client = last.client || '(Sin nombre)';
    const date = last.date;
    const lines = last.lines.map(l => [l.name, l.qty, `$${l.unitPrice.toFixed(2)}`, `$${l.subtotal.toFixed(2)}`]);
    const total = `$${last.total.toFixed(2)}`;

    // Intentamos cargar logo local (archivo en la misma carpeta llamado logo.jpg)
    const logoDataUrl = await getImageDataUrl('logo.jpg');

    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF || typeof window.jspdf === 'undefined') throw new Error('jsPDF no disponible');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Cabecera: título en negrita (se setea bold) y logo a la derecha
      const marginLeft = 40;
      let yCursor = 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Presupuesto de Globos inflados con Helio', pageWidth / 2, yCursor + 6, { align: 'center' });

      if (logoDataUrl) {
        const imgW = 70;
        const imgH = 70;
        const xRight = pageWidth - marginLeft - imgW;
        doc.addImage(logoDataUrl, logoDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG', xRight, yCursor - 6, imgW, imgH);
      }

      // espacio extra antes de la sección de metadatos y tabla
      yCursor += 90; // aumenté el espacio para dejar más margen antes del cuadro

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Cliente: ${client}`, marginLeft, yCursor);
      doc.text(`Fecha: ${date}`, marginLeft, yCursor + 16);

      // Tabla con autoTable (con bordes). startY amplia para mantener más espacio
      doc.autoTable({
        startY: yCursor + 40, // espacio adicional antes de la tabla
        head: [['Artículo', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: lines,
        theme: 'grid',
        headStyles: { fillColor: [230,230,230], textColor: 20, halign: 'center' },
        styles: { cellPadding: 6, fontSize: 10 },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        },
        didDrawPage: function (data) {
          // Pie de página en cada página
          const footerText = "El presupuesto tiene una validez de 48hs, para congelar el precio se seña con el 50%";
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(footerText, pageWidth / 2, pageHeight - 30, { align: 'center' });
        }
      });

      // Total después de la tabla
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (yCursor + 140);
      let yPos = (finalY || 120) + 18;
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 60;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Total: ${total}`, pageWidth - 40, yPos, { align: 'right' });

      const safeClient = (client || 'cliente').replace(/\s+/g, '_').replace(/[^\w\-_.]/g, '');
      doc.save(`presupuesto_${safeClient}_${Date.now()}.pdf`);
      return;
    } catch (e) {
      console.warn('Error generando PDF con jsPDF/autotable:', e);
      // fallback: ventana imprimible (intentamos pasar logoDataUrl)
      openPrintWindow(client, date, last.lines.map(l => `${l.qty}× ${l.name} ($${l.unitPrice.toFixed(2)}) → $${l.subtotal.toFixed(2)}`), `$${last.total.toFixed(2)}`, logoDataUrl);
    }
  }

  // Fallback: ventana imprimible con logo a la derecha en la cabecera
  function openPrintWindow(client, date, lines, total, logoDataUrl = null) {
    const logoHtml = logoDataUrl ? `<img src="${logoDataUrl}" style="max-width:100px; max-height:100px; float:right; margin-left:8px;">` : '';
    const html = `
      <html>
      <head>
        <title>Presupuesto - ${escapeHtml(client)}</title>
        <style>
          body{font-family: Arial, sans-serif; padding:20px; color:#111;}
          .header{overflow:hidden; margin-bottom:12px;}
          h1{font-size:18px; margin:0; display:inline-block; font-weight:700;}
          .meta{margin-bottom:8px;}
          table{width:100%; border-collapse: collapse; margin-top:12px;}
          th, td{border:1px solid #444; padding:6px; text-align:left;}
          th{background:#eee;}
          .total{font-weight:bold; margin-top:12px; text-align:right;}
          footer{position:fixed; bottom:10px; left:0; right:0; text-align:center; font-size:11px; color:#555;}
          .clearfix::after { content: ""; clear: both; display: table; }
        </style>
      </head>
      <body>
        <div class="header clearfix">
          ${logoHtml}
          <h1>Presupuesto de Globos inflados con Helio</h1>
        </div>

        <div class="meta"><strong>Cliente:</strong> ${escapeHtml(client)}</div>
        <div class="meta"><strong>Fecha:</strong> ${escapeHtml(date)}</div>

        <table>
          <thead>
            <tr><th>Artículo</th><th style="width:80px">Cantidad</th><th style="width:100px">Precio Unit.</th><th style="width:100px">Subtotal</th></tr>
          </thead>
          <tbody>
            ${lines.map(l => {
              const m = l.match(/^(\d+)×\s*(.+)\s+\((\$[\d,.]+)\)\s+→\s+(\$[\d,.]+)$/);
              if (m) {
                const qty = m[1], name = m[2], price = m[3], subtotal = m[4];
                return `<tr><td>${escapeHtml(name)}</td><td style="text-align:center">${escapeHtml(qty)}</td><td style="text-align:right">${escapeHtml(price)}</td><td style="text-align:right">${escapeHtml(subtotal)}</td></tr>`;
              } else {
                return `<tr><td colspan="4">${escapeHtml(l)}</td></tr>`;
              }
            }).join('')}
          </tbody>
        </table>

        <div class="total">Total: ${escapeHtml(total)}</div>
        <footer>El presupuesto tiene una validez de 48hs, para congelar el precio se seña con el 50%</footer>
        <script>window.onload = function(){ window.print(); }</script>
      </body>
      </html>
    `;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  }

  // Render historial
  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyEmpty.style.display = 'block';
      return;
    }
    historyEmpty.style.display = 'none';

    history.slice().reverse().forEach(entry => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const linesText = entry.lines.map(l => `${l.qty}× ${l.name} ($${l.unitPrice.toFixed(2)}) → $${l.subtotal.toFixed(2)}`).join(' · ');
      li.innerHTML = `
        <div class="d-flex justify-content-between">
          <div>
            <div class="fw-bold">${entry.client || '(Sin nombre)'} — ${entry.date}</div>
            <div class="small text-muted">${linesText}</div>
          </div>
          <div class="fs-6 fw-semibold">$${entry.total.toFixed(2)}</div>
        </div>
      `;
      historyList.appendChild(li);
    });
  }

  // Utilidades
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Eventos
  addBtn.addEventListener('click', addLine);
  calcBtn.addEventListener('click', calculateTotalAndSave);
  exportPdfBtn.addEventListener('click', exportCurrentToPdf);
  printBtn.addEventListener('click', () => {
    if (resultArea.style.display === 'none') { alert('Primero calculá el pedido para luego imprimirlo.'); return; }
    if (history.length === 0) { alert('No hay historial para imprimir.'); return; }
    const last = history[history.length - 1];
    openPrintWindow(last.client || '(Sin nombre)', last.date, last.lines.map(l => `${l.qty}× ${l.name} ($${l.unitPrice.toFixed(2)}) → $${l.subtotal.toFixed(2)}`), `$${last.total.toFixed(2)}`, null);
  });

  quantityInput.addEventListener('input', validateQuantity);

  // Render inicial
  renderCurrent();
  renderHistory();
});

