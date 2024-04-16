import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { confirmAlert } from "react-confirm-alert";
import PropTypes from "prop-types";

import { getContent } from "../redux/actions/content";

import { GoPlus } from "react-icons/go";
import { FaTrash } from "react-icons/fa";

function AdditionalContent({ regulator }) {
  const dispatch = useDispatch();
  const { contents } = useSelector((state) => state.content);
  const [dha, setDha] = useState([]);
  const [haad, setHaad] = useState([]);

  const [endPoint, setEndPoint] = useState("");

  useEffect(() => {
    dispatch(getContent());
    setEndPoint(getEndPoint());
  }, []);

  useEffect(() => {
    if (contents) {
      setDha(contents[0].description);
      setHaad(contents[1].description);
    }
  }, [contents]);

  const getEndPoint = () => {
    const currentHref = window.location.href;
    const parsedUrl = new URL(currentHref);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment);
    return pathSegments[pathSegments.length - 1];
  };

  const handleChange = (index, newValue) => {
    if (regulator === "DHA") {
      const updatedDha = [...dha];
      updatedDha[index] = newValue;
      setDha(updatedDha);
    } else if (regulator === "HAAD") {
      const updatedHaad = [...haad];
      updatedHaad[index] = newValue;
      setHaad(updatedHaad);
    }
  };

  const handleNewRow = (index) => {
    if (regulator === "DHA") {
      const updatedDha = [...dha];
      updatedDha.splice(index + 1, 0, ""); // Insert a new empty row next to the clicked row
      setDha(updatedDha);
    } else if (regulator === "HAAD") {
      const updatedHaad = [...haad];
      updatedHaad.splice(index + 1, 0, ""); // Insert a new empty row next to the clicked row
      setHaad(updatedHaad);
    }
  };

  const handleDelete = (index) => {
    confirmAlert({
      title: "Delete!",
      message: "Are you sure?",
      buttons: [
        {
          label: "Delete",
          onClick: async () => {
            if (regulator === "DHA") {
              const updatedDha = [...dha];
              updatedDha.splice(index, 1);
              setDha(updatedDha);
            } else if (regulator === "HAAD") {
              const updatedHaad = [...haad];
              updatedHaad.splice(index, 1);
              setHaad(updatedHaad);
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
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
            {regulator === "DHA"
              ? dha.length > 0 &&
                dha.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300">
                      <GoPlus
                        className="cursor-pointer"
                        onClick={() => handleNewRow(index)}
                      />
                    </td>
                    <td className="border border-gray-300">{index + 1}</td>
                    <td className="w-full border border-gray-300">
                      {endPoint === "view" ? (
                        row
                      ) : (
                        <textarea
                          value={row}
                          onChange={() => handleChange(index)}
                          className="w-full focus:outline-none bg-transparent"
                        />
                      )}
                    </td>
                    <td
                      key={`delete-${index}`}
                      className="border border-gray-300"
                    >
                      <FaTrash
                        onClick={() => handleDelete(index)}
                        className="h-4 w-4 cursor-pointer delete-icon"
                      />
                    </td>
                  </tr>
                ))
              : regulator === "HAAD" &&
                haad.length > 0 &&
                haad.map((row, index) => (
                  <tr key={index}>
                    {endPoint !== "view" && (
                      <td className="border border-gray-300">
                        <GoPlus className="cursor-pointer" />
                      </td>
                    )}
                    <td className="border border-gray-300">{index + 1}</td>
                    <td className="w-full border border-gray-300">
                      {endPoint === "view" ? row : <textarea value={row} />}
                    </td>
                    {endPoint !== "view" && (
                      <td
                        key={`delete-${index}`}
                        className="border border-gray-300"
                      >
                        <FaTrash
                          onClick={() => handleDelete(index)}
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

AdditionalContent.propTypes = {
  regulator: PropTypes.string.isRequired,
};

export default AdditionalContent;
