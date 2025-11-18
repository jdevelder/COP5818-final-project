export interface Transaction {
  id: string;
  date: string;
  type: 'Futures' | 'Options' | 'Swaps';
  side: 'Long' | 'Short' | 'Call' | 'Put' | 'Swap';
  cardId: string;
  entryPrice: string;
  exitPrice?: string;
  quantity: number;
  pnl: string;
  status: 'Active' | 'Closed' | 'Expired';
  collateral: string;
}

export function exportToCSV(transactions: Transaction[], filename = 'transactions.csv') {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Date',
    'Type',
    'Side',
    'Card',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'P&L (ETH)',
    'Status',
    'Collateral (ETH)',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(tx => [
    tx.id,
    tx.date,
    tx.type,
    tx.side,
    tx.cardId.replace(/-/g, ' '),
    tx.entryPrice,
    tx.exitPrice || 'N/A',
    tx.quantity.toString(),
    tx.pnl,
    tx.status,
    tx.collateral,
  ]);

  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(field => `"${field}"`).join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPDF(
  transactions: Transaction[],
  userAddress: string,
  filename = 'transactions.pdf'
) {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  try {
    // Dynamic import to avoid build errors if package not installed
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('TCG Derivatives Trading History', 14, 20);

  // Add user info
  doc.setFontSize(10);
  doc.text(`Wallet Address: ${userAddress}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 42);

  // Calculate summary statistics
  const totalPnL = transactions.reduce((sum, tx) => {
    const pnl = parseFloat(tx.pnl) || 0;
    return sum + pnl;
  }, 0);

  const activeTxCount = transactions.filter(tx => tx.status === 'Active').length;
  const closedTxCount = transactions.filter(tx => tx.status === 'Closed').length;

  doc.text(`Total P&L: ${totalPnL.toFixed(4)} ETH`, 14, 48);
  doc.text(`Active: ${activeTxCount} | Closed: ${closedTxCount}`, 14, 54);

  // Add table
  const tableData = transactions.map(tx => [
    tx.id.substring(0, 8) + '...',
    new Date(tx.date).toLocaleDateString(),
    tx.type,
    tx.side,
    tx.cardId.replace(/-/g, ' ').substring(0, 15),
    tx.entryPrice,
    tx.pnl,
    tx.status,
  ]);

  autoTable(doc, {
    head: [['ID', 'Date', 'Type', 'Side', 'Card', 'Entry', 'P&L', 'Status']],
    body: tableData,
    startY: 62,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [124, 58, 237], // Purple color
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 62 },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('PDF export failed. Please make sure jspdf and jspdf-autotable packages are installed:\nnpm install jspdf jspdf-autotable');
  }
}

export function getTransactionSummary(transactions: Transaction[]) {
  const summary = {
    totalTransactions: transactions.length,
    activeCount: 0,
    closedCount: 0,
    expiredCount: 0,
    totalPnL: 0,
    totalCollateral: 0,
    winningTrades: 0,
    losingTrades: 0,
    byType: {
      futures: 0,
      options: 0,
      swaps: 0,
    },
  };

  transactions.forEach(tx => {
    // Count by status
    if (tx.status === 'Active') summary.activeCount++;
    if (tx.status === 'Closed') summary.closedCount++;
    if (tx.status === 'Expired') summary.expiredCount++;

    // Calculate PnL
    const pnl = parseFloat(tx.pnl) || 0;
    summary.totalPnL += pnl;
    if (pnl > 0) summary.winningTrades++;
    if (pnl < 0) summary.losingTrades++;

    // Calculate total collateral
    summary.totalCollateral += parseFloat(tx.collateral) || 0;

    // Count by type
    if (tx.type === 'Futures') summary.byType.futures++;
    if (tx.type === 'Options') summary.byType.options++;
    if (tx.type === 'Swaps') summary.byType.swaps++;
  });

  return summary;
}
