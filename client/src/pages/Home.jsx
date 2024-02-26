import Header from "../components/Header";

const Home = () => {
  return (
    <div className=" w-[100vw] h-[100vh] flex flex-col justify-start">
      <Header />
      <div
        style={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
        className="mt-16"
      >
        <h1>Home Page</h1>
      </div>
    </div>
  );
};

export default Home;
