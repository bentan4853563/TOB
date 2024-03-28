import Proptypes from "prop-types";
import { Tooltip } from "react-tooltip";

import { MdOutlineInsertComment } from "react-icons/md";

const ViewTable = ({ tableData }) => {
  function findLargestObjectColumns(tableData) {
    if (tableData.length === 0) {
      return [];
    }
    let largestObject = tableData.reduce((maxObj, currentObj) => {
      return Object.keys(currentObj).length > Object.keys(maxObj).length
        ? currentObj
        : maxObj;
    });
    return Object.keys(largestObject);
  }

  const columns = findLargestObjectColumns(tableData);
  // Render the table
  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map((column, index) => {
            if (
              column === "status" ||
              column === "color" ||
              column === "comment"
            ) {
              return null;
            }
            return (
              <th key={index} className="p-4 first-letter:capitalize">
                {column}
              </th>
            );
          })}
          <th>Check</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, columnIndex) => {
              if (
                column === "status" ||
                column === "color" ||
                column === "comment"
              ) {
                return null;
              }
              return columnIndex < 2 ? (
                <td
                  key={columnIndex}
                  className={`${
                    row.color === "green" ? "bg-green-300" : "bg-red-300"
                  } focus:outline-none border border-gray-100`}
                >
                  {row[column]}
                </td>
              ) : (
                <td>{row[column]}</td>
              );
            })}
            <td className="w-[2rem]">
              <div className="flex gap-4 justify-end">
                {row["comment"] && (
                  <>
                    <MdOutlineInsertComment
                      data-tip
                      data-tooltip-id={`comment-${rowIndex}`}
                      className="text-green-500 focus:outline-none"
                    />
                    <Tooltip
                      id={`comment-${rowIndex}`}
                      place="bottom"
                      effect="solid"
                      content={row["comment"]}
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
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  readOnly
                  checked={row.status === "checked"}
                />
              </div>
            </td>
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
