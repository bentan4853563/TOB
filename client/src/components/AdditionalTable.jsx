import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { getContent } from "../redux/actions/content";

import { GoPlus } from "react-icons/go";
import { FaTrash } from "react-icons/fa";

function AdditionalTable({
  notes,
  handleNewAdditional,
  handleEditAdditional,
  handleDeleteAdditional,
}) {
  const dispatch = useDispatch();

  const [endPoint, setEndPoint] = useState("");

  useEffect(() => {
    dispatch(getContent());
    setEndPoint(getEndPoint());
  }, []);

  const getEndPoint = () => {
    const currentHref = window.location.href;
    const parsedUrl = new URL(currentHref);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment);
    return pathSegments[pathSegments.length - 1];
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl text-black font-bold m-4">Additional Contents</h1>
      <div className="h-[24rem] overflow-y-auto">
        <table className="w-full ">
          <thead className="table-header">
            <tr>
              {endPoint !== "view" && (
                <th className="py-2 border border-gray-300">New</th>
              )}
              <th className="py-2 border border-gray-300">No</th>
              <th className="py-2 border border-gray-300">Description</th>
              {endPoint !== "view" && (
                <th className="py-2 border border-gray-300">Del</th>
              )}
            </tr>
          </thead>
          <tbody>
            {notes &&
              notes.length > 0 &&
              notes.map((row, index) => (
                <tr key={index}>
                  {endPoint !== "view" && (
                    <td className="border border-gray-300">
                      <GoPlus
                        className="cursor-pointer"
                        onClick={() => handleNewAdditional(index)}
                      />
                    </td>
                  )}
                  <td className="border border-gray-300">{index + 1}</td>
                  <td className="w-full border border-gray-300">
                    {endPoint !== "view" ? (
                      <textarea
                        value={row}
                        onChange={(e) =>
                          handleEditAdditional(index, e.target.value)
                        }
                        className="w-full focus:outline-none bg-transparent"
                      />
                    ) : (
                      row
                    )}
                  </td>
                  {endPoint !== "view" && (
                    <td
                      key={`delete-${index}`}
                      className="border border-gray-300"
                    >
                      <FaTrash
                        onClick={() => handleDeleteAdditional(index)}
                        className="h-4 w-4 cursor-pointer delete-icon"
                      />
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

AdditionalTable.propTypes = {
  notes: PropTypes.array,
  handleNewAdditional: PropTypes.func,
  handleEditAdditional: PropTypes.func,
  handleDeleteAdditional: PropTypes.func,
};

export default AdditionalTable;
