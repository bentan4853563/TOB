// import faker from "faker";
// import { randomColor } from "./utils";

// export default function makeData(count) {
//   let data = [];
//   let options = [];
//   for (let i = 0; i < count; i++) {
//     let row = {
//       // ID: faker.mersenne.rand(),
//       firstName: faker.name.firstName(),
//       lastName: faker.name.lastName(),
//       email: faker.internet.email(),
//       age: Math.floor(20 + Math.random() * 20),
//       music: faker.music.genre(),
//     };
//     options.push({ label: row.music, backgroundColor: randomColor() });

//     data.push(row);
//   }

//   let columns = [
//     {
//       id: "firstName",
//       label: "First Name",
//       accessor: "firstName",
//       minWidth: 100,
//       dataType: "text",
//       options: [],
//     },
//     {
//       id: "lastName",
//       label: "Last Name",
//       accessor: "lastName",
//       minWidth: 100,
//       dataType: "text",
//       options: [],
//     },
//     {
//       id: "age",
//       label: "Age",
//       accessor: "age",
//       width: 80,
//       dataType: "number",
//       options: [],
//     },
//     {
//       id: "email",
//       label: "E-Mail",
//       accessor: "email",
//       width: 300,
//       dataType: "text",
//       options: [],
//     },
//     {
//       id: "music",
//       label: "Music Preference",
//       accessor: "music",
//       dataType: "select",
//       width: 200,
//       options: options,
//     },
//     {
//       id: 999999,
//       width: 20,
//       label: "+",
//       disableResizing: true,
//       dataType: "null",
//     },
//   ];
//   return { columns: columns, data: data, skipReset: false };
// }

// import { useSelector } from "react-redux";

export default function MakeData(table) {
  // const { table } = useSelector((state) => state.table);

  const tableList = Object.keys(table);

  let columns = [];
  if (tableList && tableList.length > 0) {
    const keys = Object.keys(Object.values(table[tableList[0]])[0]);
    const idIndex = keys.indexOf("filter");

    if (idIndex > -1) {
      keys.splice(idIndex, 1); // Remove 'id' from its current position
      keys.unshift("filter"); // Add 'id' to the beginning of the keys array
    }

    keys.forEach((key) => {
      columns.push({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter
        accessor: key,
        minWidth: 100,
        dataType: "text",
      });
    });
    columns.push({
      id: 999999,
      width: 20,
      label: "+",
      disableResizing: true,
      dataType: "null",
    });
  } else {
    const keys = ["Column_1", "Column_2", "Column_3", "Column_4", "Column_5"];
    keys.forEach((key) => {
      columns.push({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter
        accessor: key,
        minWidth: 100,
        dataType: "text",
      });
    });
    columns.push({
      id: 999999,
      width: 20,
      label: "+",
      disableResizing: true,
      dataType: "null",
    });
  }
  return {
    columns: columns,
    data: table,
    tableList: tableList,
    skipReset: false,
  };
}
