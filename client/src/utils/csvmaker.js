const csvmaker = function (data) {
  let csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));
  for (const row of data) {
    const values = headers.map((e) => {
      return row[e];
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

const download = function (data) {
  const blob = new Blob([data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "download.csv");
  a.click();
};

export const Makecsv = async function (jsondata) {
  console.log("jsondata", jsondata);

  const data = jsondata.map((row) => ({
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    age: row.age,
    music: row.deaths,
  }));
  console.log(data);
  const csvdata = csvmaker(data);
  download(csvdata);
};
