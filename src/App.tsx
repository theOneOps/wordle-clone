import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [grids, setGrids] = useState<Array<Array<string>>>(
    Array(6).fill(Array(5).fill(""))
  );
  const [currentGuess, setCurrentGuess] = useState(0);

  const [classes, setClasses] = useState<Array<Array<string>>>(
    Array(6).fill(Array(5).fill("flip-card-back"))
  );

  const [classesHeads, setClassesHeads] = useState<Array<Array<string>>>(
    Array(6).fill(Array(5).fill("flip-card-inner"))
  );

  const [solution, setSolution] = useState<Array<string>>([
    "r",
    "e",
    "p",
    "a",
    "s",
  ]);

  const [isGameOver, setIsGameOver] = useState(false);

  const [findSolution, setFindSolution] = useState(false);

  // function to remove all accents on vowel
  function removeAccents(str:string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

  const fetchWord = async () => {
    try {
      const api = "http://localhost:5000/api/words";
      const response = await fetch(api);
      const data: string[] = await response.json();

      setSolution(removeAccents(data[0]).split(""));

      setClassesHeads(
        Array(6).fill(Array(data[0].split("").length).fill("flip-card-inner"))
      );
      setClasses(
        Array(6).fill(Array(data[0].split("").length).fill("flip-card-back"))
      );
      setGrids(Array(6).fill(Array(data[0].split("").length).fill("")));

      setIsGameOver(false);
      setCurrentGuess(0);
      setFindSolution(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`problem occurred: ${error.message}`);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    fetchWord();
    console.log("just the first time");
  }, []);

  useEffect(() => {
    function handleType(e: KeyboardEvent) {
      if (isGameOver || currentGuess >= 6) return;

      if (!isGameOver) {
        if (e.key === "Enter" && !grids[currentGuess].includes("")) {
          e.preventDefault();
          setClasses((prevClasses) => {
            const currentClasses = prevClasses.map((row) => [...row]);

            setClassesHeads((prevClassesHeads) => {
              const newClassesHeads = prevClassesHeads.map((row) => [...row]);
              for (let i = 0; i < newClassesHeads[currentGuess].length; i++) {
                newClassesHeads[currentGuess][i] += " after-enter";
              }
              return newClassesHeads;
            });

            const currentGrids = grids.map((row) => [...row]);

            const rowGrid = currentGrids[currentGuess];

            const rowClass = currentClasses[currentGuess];

            const lineContainsBlank = rowGrid.findIndex((cell) => cell === "");

            if (lineContainsBlank === -1) {
              for (let i = 0; i < solution.length; i++) {
                if (solution.includes(rowGrid[i])) {
                  if (solution[i] === rowGrid[i]) {
                    rowClass[i] += " correct";
                  } else {
                    rowClass[i] += " incorrect";
                  }
                } else {
                  rowClass[i] += " not-in-word";
                }
              }
              setCurrentGuess(currentGuess + 1);
            }

            if (rowGrid.join("") === solution.join("")) {
              setIsGameOver(true);
              setFindSolution(true);
              return currentClasses;
            }

            return currentClasses;
          });
        }

        if (e.key === "Backspace") {
          e.preventDefault();
          setGrids((prevGrids) => {
            const currentGrids = prevGrids.map((row) => [...row]);

            const row = currentGrids[currentGuess];

            let indexOfLastBlank = -1;

            for (let i = solution.length - 1; i >= 0; i--) {
              if (row[i] !== "") {
                indexOfLastBlank = i;
                break;
              }
            }

            if (indexOfLastBlank !== -1) {
              row[indexOfLastBlank] = "";
            }

            return currentGrids;
          });
        }

        if (!/^[a-zA-Z]$/.test(e.key)) return;

        if (e.key) {
          setGrids((prevGrids) => {
            const currentGrids = prevGrids.map((row) => [...row]);

            const row = currentGrids[currentGuess];

            const indexOfFstBlank = row.findIndex((cell) => cell === "");

            if (indexOfFstBlank !== -1) {
              row[indexOfFstBlank] = e.key;
            }

            return currentGrids;
          });
        }
      }
    }

    window.addEventListener("keydown", handleType);

    return () => window.removeEventListener("keydown", handleType);
  }, [currentGuess, grids, solution, isGameOver, classesHeads]);

  return (
    <div className="container">
      <h1>a simple wordle redo with reveal a animation</h1>
      {/* <h3>{solution.join("")}</h3> */}
      <div
        className="grids"
        style={{
          gridTemplateColumns: `repeat(${solution.length}, 80px)`,
        }}>
        {grids.map((line, idx) =>
          line.map((letter, index) => (
            <div className="flip-card" key={`${idx}${index}`}>
              <div className={classesHeads[idx][index]} style={{transitionDelay:`0.${index}s` }}>
                <div className="flip-card-front">{letter}</div>
                <div className={classes[idx][index]}>{letter}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {(isGameOver === true || currentGuess >= 6) && findSolution === false && (
        <div className="solution-class">
          the solution was <span>{solution.join("")}</span>
        </div>
      )}

      {(isGameOver === true || currentGuess >= 6) && findSolution === true && (
        <div className="solution-class">
          Congratulations, Yes the solution was <span>{solution.join("")}</span>
          You succeed to find it in {currentGuess} over 6 trials !
        </div>
      )}

      <button onClick={fetchWord}>Again</button>
    </div>
  );
}

export default App;
