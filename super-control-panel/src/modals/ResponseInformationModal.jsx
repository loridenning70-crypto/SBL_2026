import { colors } from "../utils/colors";

export default function ResponseInformationModal({ response }) {
  console.log(response);
  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <p style={styles.title}>General</p>
        <p style={styles.subtitle}>Output ID: {response.output_id}</p>
        <p style={styles.subtitle}>Response ID: {response.response_id}</p>
        <p style={styles.subtitle}>Run ID: {response.run}</p>
        <p style={styles.subtitle}>Loop Index: {response.loop_index}</p>
      </div>

      <div style={styles.section}>
        <p style={styles.title}>Tokens</p>
        <p style={styles.subtitle}>input_tokens: {response.input_tokens}</p>
        <p style={styles.subtitle}>output_tokens: {response.output_tokens}</p>
        <p style={styles.subtitle}>cache_creation_input_tokens: {response.cache_creation_input_tokens}</p>
        <p style={styles.subtitle}>cache_read_input_tokens: {response.cache_read_input_tokens}</p>
      </div>

      <div style={styles.section}>
        <p style={styles.title}>Other</p>
        <p style={styles.subtitle}>Model: {response.model}</p>
        <p style={styles.subtitle}>Stop Reason: {response.stop_reason}</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,

    width: 400,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.bg,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    margin: 0,
  },
}
