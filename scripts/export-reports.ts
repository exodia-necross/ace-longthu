import * as XLSX from "xlsx";
import { matches, players, rankings, teams } from "../lib/mock-data";

const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(players), "Van dong vien");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(teams), "Cap dau");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(matches), "Lich thi dau");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rankings), "Bang xep hang");

XLSX.writeFile(workbook, "ace-badminton-report.xlsx");
