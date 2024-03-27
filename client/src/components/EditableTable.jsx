import Proptypes from "prop-types";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Tooltip } from "react-tooltip";

import { FaTrash } from "react-icons/fa";
import { MdOutlineInsertComment } from "react-icons/md";

const EditableTable = ({
  tableName,
  tableData,
  handleEdit,
  handleConfirm,
  handleFocus,
  handleDelete,
}) => {
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

  const onClickDeleteIcon = (rowIndex) => {
    confirmAlert({
      title: "Confirm!",
      message: "Are you sure to delete this row?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            handleDelete(tableName, rowIndex);
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  // Render the table
  return (
    <table className="w-full">
      <thead className="table-header">
        <tr className="">
          {columns.map((column, index) => {
            if (
              column === "status" ||
              column === "color" ||
              column === "comment"
            ) {
              return null;
            }
            return (
              <th
                key={index}
                className="p-4 first-letter:capitalize border border-gray-200"
              >
                {column}
              </th>
            );
          })}
          <th className="border border-gray-200">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex} className="table-row">
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
                  onClick={() => handleFocus(tableName, rowIndex, columnIndex)}
                  className={`${
                    row.color === "green"
                      ? "status-checked"
                      : "status-unchecked"
                  } focus:outline-none border border-gray-200`}
                >
                  {row[column]}
                </td>
              ) : (
                <td className="input-cell w-1/4 border border-gray-200">
                  <input
                    type="text"
                    value={row[column]}
                    onFocus={() =>
                      handleFocus(tableName, rowIndex, columnIndex)
                    }
                    onChange={(e) =>
                      handleEdit(tableName, e.target.value, rowIndex, column)
                    }
                    className="w-full focus:outline-none text-wrap"
                  />
                </td>
              );
            })}
            <td className="w-[4rem] border border-gray-200 input-cell">
              <div className="flex gap-4 items-center justify-end">
                {row["comment"] && (
                  <>
                    <MdOutlineInsertComment
                      data-tip
                      data-tooltip-id={`comment-${rowIndex}`}
                      className="comment-icon focus:outline-none"
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
                  className="h-4 w-4"
                  onChange={() => handleConfirm(tableName, rowIndex)}
                  checked={row.status === "checked"}
                />
                <FaTrash
                  onClick={() => onClickDeleteIcon(rowIndex)}
                  className="h-4 w-4 cursor-pointer delete-icon"
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

EditableTable.propTypes = {
  tableName: Proptypes.string.isRequired,
  tableData: Proptypes.array.isRequired,
  handleEdit: Proptypes.func.isRequired,
  handleConfirm: Proptypes.func.isRequired,
  handleFocus: Proptypes.func.isRequired,
  handleDelete: Proptypes.func.isRequired,
};

export default EditableTable;
