import Proptypes from "prop-types";
import "react-confirm-alert/src/react-confirm-alert.css";
import { confirmAlert } from "react-confirm-alert";
import { Tooltip } from "react-tooltip";

import { FaTrash } from "react-icons/fa";
import { MdOutlineInsertComment } from "react-icons/md";
import { GoPlus } from "react-icons/go";

const EditableTable = ({
  tableName,
  tableData,
  handleEdit,
  handleConfirm,
  newRow,
  handleDelete,
}) => {
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

  const onClickDeleteIcon = (rowIndex) => {
    confirmAlert({
      title: "Delete!",
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
          <th className="px-2">New</th>
          {columns.map((column, index) => {
            return (
              <th
                key={index}
                className="p-2 first-letter:capitalize border border-gray-300"
              >
                {column}
              </th>
            );
          })}
          <th>Del</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex} className="w-full">
            <td className="border border-gray-300">
              <GoPlus
                onClick={() => newRow(tableName, rowIndex)}
                className="cursor-pointer"
              />
            </td>
            {columns.map((column, columnIndex) => {
              if (columnIndex < 2) {
                if (row.color !== "yellow") {
                  return (
                    <td
                      key={columnIndex}
                      // onClick={() =>
                      //   handleFocus(tableName, rowIndex, columnIndex)
                      // }
                      className={`w-1/4 ${
                        row.color === "green"
                          ? "status-checked"
                          : "status-unchecked"
                      } focus:outline-none border border-gray-300`}
                    >
                      {row[column]}
                    </td>
                  );
                } else {
                  return (
                    <td
                      key={columnIndex}
                      // onClick={() =>
                      //   handleFocus(tableName, rowIndex, columnIndex)
                      // }
                      className={`w-1/4 bg-white focus:outline-none border border-gray-300`}
                    >
                      <input
                        type="text"
                        value={row[column]}
                        onChange={(e) =>
                          handleEdit(tableName, e.target.value, row.id, column)
                        }
                        className="w-full bg-transparent focus:outline-none text-wrap"
                      />
                    </td>
                  );
                }
              }
              if (columnIndex === 2) {
                return (
                  <td key={columnIndex} className="border border-gray-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      onChange={() => handleConfirm(tableName, row.id, column)}
                      checked={row.edit}
                    />
                  </td>
                );
              }
              if (columnIndex > 2 && columnIndex < 5) {
                return (
                  <td
                    key={columnIndex}
                    className="w-1/4 border border-gray-300"
                  >
                    {row["edit"] === true ? (
                      <input
                        type="text"
                        value={row[column]}
                        onChange={(e) =>
                          handleEdit(tableName, e.target.value, row.id, column)
                        }
                        className="w-full focus:outline-none text-wrap"
                      />
                    ) : (
                      row[column]
                    )}
                  </td>
                );
              }
              if (columnIndex === 5) {
                return (
                  <td
                    key={column}
                    className="w-[4rem] px-2 mx-auto border border-gray-300"
                  >
                    {row["Edit Reason"] !== "" && (
                      <>
                        <MdOutlineInsertComment
                          data-tip
                          data-tooltip-id={`comment-${rowIndex}-${columnIndex}`}
                          className="comment-icon focus:outline-none cursor-pointer"
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
                  <td key={columnIndex} className="border border-gray-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      // onChange={() =>
                      //   handleConfirm(tableName, rowIndex, column)
                      // }
                      readOnly
                      checked={row["Review Required"]}
                    />
                  </td>
                );
              }
              if (columnIndex === 7) {
                return (
                  <td key={columnIndex} className="px-2 border border-gray-300">
                    {row["Review Required"] && (
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={() =>
                          handleConfirm(tableName, row.id, column)
                        }
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
                    className="px-2 border border-gray-300"
                  >
                    {row["Review Comment"] !== "" && (
                      <>
                        <MdOutlineInsertComment
                          data-tip
                          data-tooltip-id={`ReviewComment-${rowIndex}`} // changed to `data-for` to match Tooltip's expected prop
                          className="comment-icon focus:outline-none cursor-pointer"
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
            <td key={`delete-${rowIndex}`} className="border border-gray-300">
              <FaTrash
                onClick={() => onClickDeleteIcon(row.id)}
                className="h-4 w-4 cursor-pointer delete-icon"
              />
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
  newRow: Proptypes.func.isRequired,
  handleDelete: Proptypes.func.isRequired,
};

export default EditableTable;
