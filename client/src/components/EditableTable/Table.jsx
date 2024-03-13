import { useMemo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  useTable,
  useFlexLayout,
  useResizeColumns,
  useSortBy,
} from "react-table";

import Default from "./DefaultCell";
import Cell from "./Cell";
import Header from "./Header";

import { GoPlus } from "react-icons/go";
import { BsTrash3 } from "react-icons/bs";

export default function Table({
  columns,
  data,
  dispatch: dataDispatch,
  skipReset,
  handleClick,
  isEditable,
}) {
  const handleCloseClick = (index) => {
    handleClick(index);
  };
  const defaultColumn = {
    minWidth: 50,
    width: 150,
    maxWidth: 400,
    Cell: isEditable ? Cell : Default,
    Header: Header,
    sortType: "alphanumericFalsyLast",
    isEditable,
  };

  // const newColumns = isEditable ? columns : columns.slice(0, -1);

  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast(rowA, rowB, columnId, desc) {
        if (!rowA.values[columnId] && !rowB.values[columnId]) {
          return 0;
        }

        if (!rowA.values[columnId]) {
          return desc ? -1 : 1;
        }

        if (!rowB.values[columnId]) {
          return desc ? 1 : -1;
        }

        return isNaN(rowA.values[columnId])
          ? rowA.values[columnId].localeCompare(rowB.values[columnId])
          : rowA.values[columnId] - rowB.values[columnId];
      },
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        defaultColumn,
        dataDispatch,
        autoResetSortBy: !skipReset,
        autoResetFilters: !skipReset,
        autoResetRowState: !skipReset,
        sortTypes,
      },
      useFlexLayout,
      useResizeColumns,
      useSortBy
    );

  function isTableResizing() {
    for (let headerGroup of headerGroups) {
      for (let column of headerGroup.headers) {
        if (column.isResizing) {
          return true;
        }
      }
    }

    return false;
  }

  return (
    <>
      <div
        {...getTableProps()}
        className={clsx("table", isTableResizing() && "noselect")}
        style={{ width: "100%" }}
      >
        {/* <IoMdClose /> */}
        <div className="ml-[49px]">
          {headerGroups.map((headerGroup, index) => (
            <div
              key={index}
              {...headerGroup.getHeaderGroupProps()}
              className="tr"
            >
              {/* <div className="flex items-center border-r-[1px] border-b-[1px] border-gray-300">
                <IoMdClose className="cursor-pointer" />
              </div> */}
              {headerGroup.headers.map((column) => column.render("Header"))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <div key={index} {...row.getRowProps()} className="tr">
                <span
                  className={`flex items-center px-4 border-b-[1px] border-r-[1px] border-gray-300 ${
                    index === 0 ? "border-t-[1px] -mt-[1px]" : ""
                  }`}
                >
                  <BsTrash3
                    className="cursor-pointer"
                    onClick={() => handleCloseClick(index)}
                  />
                </span>
                {row.cells.map((cell, index) => {
                  return (
                    <div key={index} {...cell.getCellProps()} className="td">
                      {cell.render("Cell")}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {isEditable && (
            <div
              className="tr add-row"
              onClick={() => dataDispatch({ type: "add_row" })}
            >
              <span className="svg-icon svg-gray" style={{ marginRight: 4 }}>
                <GoPlus />
              </span>
              New
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  skipReset: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
};
