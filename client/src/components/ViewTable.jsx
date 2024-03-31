import Proptypes from "prop-types";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Tooltip } from "react-tooltip";

import { MdOutlineInsertComment } from "react-icons/md";

const ViewTable = ({ tableData }) => {
  const columns = [
    "benefit",
    "limit",
    "edit",
    "New Benefit",
    "New Limit",
    "Edit Reason",
    "Review Required",
    "Reviewed",
    "Review Comment",
  ];
  // Render the table
  console.log("==>", tableData);
  return (
    <table className="w-full">
      <thead className="table-header">
        <tr className="">
          {columns.map((column, index) => {
            return (
              <th
                key={index}
                className="p-2 first-letter:capitalize border border-gray-200"
              >
                {column}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex} className="w-full">
            {columns.map((column, columnIndex) => {
              if (columnIndex < 2) {
                if (row.color !== "yellow") {
                  return (
                    <td
                      key={columnIndex}
                      className={`w-1/4 ${
                        row.color === "green"
                          ? "status-checked"
                          : "status-unchecked"
                      } focus:outline-none border border-gray-200`}
                    >
                      {row[column]}
                    </td>
                  );
                } else {
                  return (
                    <td
                      key={columnIndex}
                      className={`w-1/4 bg-white focus:outline-none border border-gray-200`}
                    >
                      <input
                        type="text"
                        value={row[column]}
                        className="w-full bg-transparent focus:outline-none text-wrap"
                      />
                    </td>
                  );
                }
              }
              if (columnIndex === 2) {
                return (
                  <td key={columnIndex} className="border border-gray-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      readOnly
                      checked={row.edit}
                    />
                  </td>
                );
              }
              if (columnIndex > 2 && columnIndex < 5) {
                return (
                  <td
                    key={columnIndex}
                    className="w-1/4 border border-gray-200"
                  >
                    {row[column]}
                  </td>
                );
              }
              if (columnIndex === 5) {
                return (
                  <td
                    key={column}
                    className="w-[4rem] px-2 mx-auto border border-gray-200"
                  >
                    {row[column] !== "" && (
                      <>
                        <MdOutlineInsertComment
                          data-tip
                          data-tooltip-id={`comment-${rowIndex}-${columnIndex}`}
                          className="comment-icon focus:outline-none"
                        />
                        <Tooltip
                          id={`comment-${rowIndex}-${columnIndex}`}
                          place="bottom"
                          effect="solid"
                          content={row["Edit Reason"]}
                          style={{
                            width: "240px",
                            textAlign: "left",
                            fontSize: "14px",
                            backgroundColor: "#595959",
                            color: "white",
                            borderRadius: "4px",
                            padding: "8px",
                          }}
                        />
                      </>
                    )}
                  </td>
                );
              }
              if (columnIndex === 6) {
                return (
                  <td key={columnIndex} className="border border-gray-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      readOnly
                      checked={row["Review Required"]}
                    />
                  </td>
                );
              }
              if (columnIndex === 7) {
                return (
                  <td key={columnIndex} className="px-2 border border-gray-200">
                    {row["Review Required"] && (
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        readOnly
                        checked={row.Reviewed}
                      />
                    )}
                  </td>
                );
              }
              if (columnIndex === 8) {
                return (
                  <td
                    key={`comment-cell-${rowIndex}`}
                    className="px-2 border border-gray-200"
                  >
                    {row["Review Comment"] !== "" && (
                      <>
                        <MdOutlineInsertComment
                          data-tip
                          data-tooltip-id={`ReviewComment-${rowIndex}`} // changed to `data-for` to match Tooltip's expected prop
                          className="comment-icon focus:outline-none"
                        />
                        <Tooltip
                          id={`ReviewComment-${rowIndex}`}
                          place="bottom"
                          effect="solid"
                          className="tooltip-custom" // use a className for styling instead of inline styles
                        >
                          {row["Review Comment"]}
                        </Tooltip>
                      </>
                    )}
                  </td>
                );
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

ViewTable.propTypes = {
  tableData: Proptypes.array.isRequired,
};

export default ViewTable;
