const F = "monospace";

const Sec = ({ title, children, style: st }) => (
  <div
    style={{
      background: "linear-gradient(135deg,#0c1e0c,#162416)",
      border: "1px solid rgba(212,168,67,.22)",
      borderRadius: 5,
      padding: 7,
      marginBottom: 6,
      ...st,
    }}
  >
    <div
      style={{
        fontFamily: F,
        fontSize: 7,
        color: "#d4a843",
        letterSpacing: 2,
        textTransform: "uppercase",
        borderBottom: "1px solid rgba(212,168,67,.18)",
        paddingBottom: 3,
        marginBottom: 5,
        textAlign: "center",
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

export default Sec;
