import { Segment } from '../utils/types'

interface ClinicalSummaryHeaderProps {
  segments: Segment[]
}

const ClinicalSummaryHeader = ({ segments }: ClinicalSummaryHeaderProps) => {
  return (
    <div className="clinical-summary-header">
      {/* CRITICAL - IMMEDIATE ATTENTION */}
      <div className="summary-section">
        <div className="summary-section-header critical">
          <div className="summary-icon critical">!</div>
          <span>CRITICAL - IMMEDIATE ATTENTION</span>
        </div>
        <div className="summary-cards">
          <div className="summary-card critical">
            <div className="summary-card-title">Type 2 Diabetes - Uncontrolled</div>
            <div className="summary-card-content">
              Last BP: 145/79 (Sep 2). Three of last five readings elevated. Assess medication adherence and lifestyle factors.
            </div>
          </div>
          <div className="summary-card critical">
            <div className="summary-card-title">Recent ER Visit</div>
            <div className="summary-card-content">
              Sep 2: Evaluated for chest pain. Cardiac causes ruled out. May indicate stress or metabolic issues related to poor diabetes control.
            </div>
          </div>
        </div>
      </div>

      {/* TRENDING CONCERNS - MONITOR CLOSELY */}
      <div className="summary-section">
        <div className="summary-section-header trending">
          <div className="summary-icon trending">!</div>
          <span>TRENDING CONCERNS - MONITOR CLOSELY</span>
        </div>
        <div className="summary-cards">
          <div className="summary-card trending">
            <div className="summary-card-title">Type 2 Diabetes - Uncontrolled</div>
            <div className="summary-card-content">
              A1C jumped from 5.5% to 8.7% over 6 months. Recent glucose readings: 168, 179, 143 mg/dL. Consider medication intensification.
            </div>
          </div>
          <div className="summary-card trending">
            <div className="summary-card-title">BUN Elevation - New Finding</div>
            <div className="summary-card-content">
              BUN elevated to 30 mmol/L (baseline 20-27). Cr stable. Evaluate for dehydration, AKI, or medication effects.
            </div>
          </div>
        </div>
      </div>

      {/* STABLE - CONTINUE CURRENT MANAGEMENT */}
      <div className="summary-section">
        <div className="summary-section-header stable">
          <div className="summary-icon stable">✓</div>
          <span>STABLE - CONTINUE CURRENT MANAGEMENT</span>
        </div>
        <div className="summary-cards">
          <div className="summary-card stable">
            <div className="summary-card-title">CKD Stage 3 - Stable</div>
            <div className="summary-card-content">
              eGFR consistently 57-63 mL/min/1.73m². Creatinine 0.97-1.06 mg/dL. Continue monitoring.
            </div>
          </div>
          <div className="summary-card stable">
            <div className="summary-card-title">Hypothyroidism - Well-Managed</div>
            <div className="summary-card-content">
              No recent thyroid concerns. Continue current therapy.
            </div>
          </div>
          <div className="summary-card stable">
            <div className="summary-card-title">Anemia - Resolved</div>
            <div className="summary-card-content">
              Last documented Jan 2024. No recent findings. No action needed.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicalSummaryHeader
