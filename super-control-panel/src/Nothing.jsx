export default function Nothing({ label }) {
  return (
    <div style={styles.container}>
      <p style={styles.text}>{label}</p>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  text: {
    fontSize: '18px',
    color: '#888',
  },
}