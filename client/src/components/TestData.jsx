import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const data = [
  {
    column1: "Row 1 Col 1",
    column2: "Row 1 Col 2",
    column3: "Row 1 Col 2",
    column4: "Row 1 Col 2",
    column5: "Row 1 Col 2",
  },
  { column1: "Row 2 Col 1", column2: "Row 2 Col 2" },
];

const downloadPdf = () => {
  const doc = new jsPDF();
  const columns = Object.keys(data[0]);
  autoTable(doc, {
    head: [columns],
    body: data.map((row) => columns.map((col) => row[col])),
    didDrawPage: (dataArg) => {
      // Add document title or any header if required
      doc.text("Your Table Title", 20, 10);
    },
  });

  doc.save("table.pdf");
};

// Assuming this is a React component
const TestData = () => {
  return (
    <div>
      <button onClick={downloadPdf}>Download PDF</button>
    </div>
  );
};

export default TestData;
