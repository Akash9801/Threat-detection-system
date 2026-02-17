import { getRiskLevel } from "../utils/riskUtils";

export default function AlertPanel({ alerts }) {
  return (
    <div className="alert-card">
      <h3>Recent Alerts</h3>

      {alerts.length === 0 && <p>No anomalies detected.</p>}

      {alerts.map((alert, index) => {
        const risk = getRiskLevel(Math.abs(alert.score));

        return (
          <div
            key={index}
            className="alert-item"
            style={{ borderLeft: `4px solid ${risk.color}` }}
          >
            <div>
              <strong>{alert.user}</strong>
              <span className="risk-label" style={{ color: risk.color }}>
                {risk.label}
              </span>
            </div>
            <p>Score: {alert.score.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
  );
}
