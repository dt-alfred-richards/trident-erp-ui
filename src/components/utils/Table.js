import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

export default function DataTable({
  checkboxSelection = true,
  hideFooterPagination,
  rows,
  pageSize = 5,
  columns,
  getRowId = () => {},
  onRowSelect = () => {},
  rowSelection = true,
  uniqueField = "",
}) {
  const paginationModel = React.useMemo(
    () => ({ page: 0, pageSize }),
    [pageSize]
  );

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
    <Paper sx={{ height: "max-content", maxHeight: "100%", width: "100%" }}>
      <DataGrid
        rows={updatedRows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection={checkboxSelection}
        hideFooterPagination={hideFooterPagination}
        onRowSelectionModelChange={(selectedIds) => {
          onRowSelect(
            updatedRows?.filter((item) =>
              selectedIds.includes(item[uniqueField])
            )
          );
        }}
        rowSelection={rowSelection}
        sx={{ border: 0 }}
        getRowId={(row) => row[uniqueField]}
      />
    </Paper>
  );
}
