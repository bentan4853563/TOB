export default function MakeData(table) {
  const tableList = Object.keys(table);
  console.log(table);
  let columns = [];
  if (tableList && tableList.length > 0) {
    tableList.forEach((name) => {
      // Use 'forEach' instead of 'map' since you don't return anything
      const keys = Object.keys(Object.values(table[name])[0]);
      const idIndex = keys.indexOf("filter");

      if (idIndex > -1) {
        keys.splice(idIndex, 1);
        keys.unshift("filter");
      }

      columns[name] = []; // Initialize the array for the current table name
      keys.forEach((key) => {
        columns[name].push({
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter
          accessor: key,
          minWidth: 100,
          dataType: "text",
        });
      });

      // columns[name].push({
      //   id: 999999,
      //   width: 20,
      //   label: "+",
      //   disableResizing: true,
      //   dataType: "null",
      // });
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
    // columns.push({
    //   id: 999999,
    //   width: 20,
    //   label: "+",
    //   disableResizing: true,
    //   dataType: "null",
    // });
  }

  return {
    columns: columns,
    data: table,
    tableList: tableList,
    skipReset: false,
  };
}
