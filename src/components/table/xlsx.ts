import xlsx, { IJsonSheet } from "json-as-xlsx";

export function exportToExcel(cols: any, data: any, name: string) {
  let columns: IJsonSheet[] = [
    {
      sheet: "Data sheet",
      columns: cols,
      content: data,
    },
  ];

  let settings = {
    fileName: "Data sheet",
  };

  xlsx(columns, settings);
}
