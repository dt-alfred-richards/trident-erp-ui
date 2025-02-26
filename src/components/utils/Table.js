import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

export default function DataTable({
  checkboxSelection = true,
  hideFooterPagination,
  rows,
  pageSize = 5,
  columns,
  onRowSelect = () => {},
}) {
  const paginationModel = React.useMemo(
    () => ({ page: 0, pageSize }),
    [pageSize]
  );

  return (
    <Paper sx={{ height: "max-content", maxHeight: "100%", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection={checkboxSelection}
        hideFooterPagination={hideFooterPagination}
        onRowSelectionModelChange={(selectedIds) =>
          onRowSelect(rows.filter((item) => selectedIds.includes(item.id)))
        }
        rowSelection={false}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
