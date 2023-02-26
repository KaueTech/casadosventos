import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
let PizZipUtils = null;

if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}

export const generateDocument = (modelo, data, filename) => {
  PizZipUtils.getBinaryContent(
    modelo,
    function (error, content) {
      if (error) {
        throw error;
      }
      let zip = new PizZip(content);
      let doc = new Docxtemplater(zip)

      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render(data)

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      // Output the document using Data-URI
      saveAs(blob, filename);
    }
  );
};

export function breakLine(lines = 1) {
  return Array.apply(null, new Array(lines)).map(_ => '<w:br/>').join('')
}

export function table(rows: string[], props?: { colsWidth?: number[] }) {
  return `
  <w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="TableGrid" />
    <w:tblW w:w="0" w:type="auto" />
    <w:tblLook w:val="04A0" />
  </w:tblPr>
  <w:tblGrid>
    ${props?.colsWidth?.map(width => `<w:gridCol w:w="${width}" />`).join('') || ""}
  </w:tblGrid>

  ${rows.join('')}
</w:tbl>`

}

export function tableRow(cells: string[], props: string[][] = []) {
  return `
    <w:tr >
      <w:trPr>
        ${props?.map((prop) => {
    return `<w:${prop.at(0)} ${prop.at(1) ? 'w:val="' + prop.at(1) + '"' : ""}/>`
  }).join('') || ""}
      </w:trPr>
      ${cells.join('')}
    </w:tr>
  `
}

export function tableCell(paragraph: string, props: string[][] = []) {
  return `
    <w:tc >
      <w:tcPr>
        ${props?.map((prop) => {
    return `<w:${prop.at(0)} ${prop.at(1) ? 'w:val="' + prop.at(1) + '"' : ""}/>`
  }).join('') || ""}
      </w:tcPr>
      ${paragraph}
    </w:tc>
  `
}

export function text(texto: string, props: string[][] = [], font = 'Tahoma') {
  if (!props.find(p => p[0] == 'sz')) {
    props.push(['sz', '22'])
  }

  return `
    <w:r >
      <w:rPr>
        ${props?.map((prop) => {
    return `<w:${prop.at(0)} ${prop.at(1) ? 'w:val="' + prop.at(1) + '"' : ""}/>`
  }).join('') || ""}
        <w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>
      </w:rPr>
      <w:t xml:space="preserve">${texto.replaceAll(" ", '\n')}</w:t>
    </w:r>
  `
}

export function paragraph(textos: string[], props: string[][] = [], font = 'Tahoma') {
  return `<w:p><w:pPr>${props?.map((prop) => {
    return `<w:${prop.at(0)} ${prop.at(1) ? 'w:val="' + prop.at(1) + '"' : ""}/>`
  }).join('') || ""}<w:pFonts w:ascii="${font}" w:hAnsi="${font}"/></w:pPr>${textos.join("")}</w:p>`
}
