export default function Loading() {
  return <div style={styles.spinner} />;
}

const styles = {
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #2e303a",
    borderTop: "4px solid #e5e7eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};