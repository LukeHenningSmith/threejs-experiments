import "./App.css";
import Cubes from "./components/Cubes";
import Clouds from "./components/Clouds";
import Earth from "./components/Earth";

function App() {
  return (
    <>
      <div
        style={{
          justifyItems: "center",
        }}
      >
        <div
          style={{ padding: "50px", marginTop: "-50px", marginBottom: "50px" }}
        >
          <Cubes width={300} height={300} />

          <Clouds />

          <Earth />
        </div>
      </div>
    </>
  );
}

export default App;
