import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

export default function BasicTable({ style, rows, columns }) {
  const updatedRows = React.useMemo(() => {
    return rows.map((item) => {
      let newRow = {};
      columns.forEach(({ field = "" }) => {
        newRow[field] = item[field];
      });
      return newRow;
    });
  }, [rows]);
  return (
    <TableContainer
      component={Paper}
      style={{ minHeight: "max-content", ...style }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map(({ headerName }) => (
              <TableCell>{headerName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {updatedRows.map((row) => (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {columns.map(({ field }) => (
                <TableCell>{row[field]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
