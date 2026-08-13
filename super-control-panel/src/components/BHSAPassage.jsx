import { useEffect, useState } from "react";
import Loading from "./Loading";

export default function BHSAPassage({ charCode }) {
  const [passage, setPassage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPassage(null);

    async function load() {
      const module = await import("../../../data/passages.json");

      if (!cancelled) {
        const charPassages = module.default[charCode];
        const refinedHebrew = charPassages?.reduce((acc, curr) => {
          const ref = curr?.f?.split(":")
          const key = `${ref[0]} ${ref[1]}`;
          console.log('key: ', key, ref, curr?.h);
          if (acc[key]) {
            acc[key].push({
              verse: ref[2],
              h: curr?.h
            });
          } else {
            acc[key] = [{
              verse: ref[2],
              h: curr?.h
            }];
          }

          return acc;
        }, {});
        console.log("Refined Hebrew passages:", refinedHebrew);
        setPassage(refinedHebrew);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [charCode]);

  if (!passage) {
    return (
      <div style={styles.container}>
        <Loading />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* <p style={styles.header}>BHSA Passage</p> */}
      <div style={styles.content}>
        {Object.entries(passage).map(([ref, verses]) => (
          <div key={ref} style={styles.passageBlock}>
            <p style={styles.passageRef}>{ref}</p>
            {verses.map((verse, index) => (
              <p key={index} style={styles.passageVerse}>
                <span style={styles.passageVerseNum}>{verse.verse}</span> {verse.h}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",

    border: "1px solid #ccc",
    borderRadius: 12,
    backgroundColor: "#192841",

    overflow: "hidden",

    margin: "35px 0",
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    margin: 0,

    borderBottom: "1px solid #ccc"
  },
  content: {
    height: 300,
    overflowY: "auto",
    padding: '0px 15px',
  },
  passageBlock: {
    marginBottom: 10,
  },
  passageRef: {
    fontWeight: "bold",
  },
  passageVerse: {
    margin: "2px 0",
  },
  passageVerseNum: {
    fontWeight: "bold",
    marginRight: 5,
  }
};