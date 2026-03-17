import { Segment } from '../utils/types'

interface ClinicalSummaryHeaderProps {
  segments: Segment[]
}

const ClinicalSummaryHeader = ({ segments: _segments }: ClinicalSummaryHeaderProps) => {
  return (
    <div className="clinical-summary-header">

      {/* CRITICAL - IMMEDIATE ATTENTION */}
      <div className="summary-section">
        <div className="summary-section-header critical">
          <div className="summary-icon critical">!</div>
          <span>CRITICAL - IMMEDIATE ATTENTION</span>
        </div>
        <div className="summary-cards">
          <div className="summary-card critical summary-card-empty-state">
            <div className="summary-card-content summary-card-empty-text">
              No current critical issues based on the latest available vitals, labs, and symptom data.
            </div>
          </div>
        </div>
      </div>

      {/* TRENDING CONCERNS - MONITOR CLOSELY */}
      <div className="summary-section">
        <div className="summary-section-header trending">
          <div className="summary-icon trending">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </div>
          <span>TRENDING CONCERNS - MONITOR CLOSELY</span>
        </div>
        <div className="summary-cards">
          <div className="summary-card trending">
            <div className="summary-card-title">Type 2 Diabetes — Improved, Continue Monitoring</div>
            <div className="summary-card-content">
              A1c improved from 10.8% to 6.7%. Latest glucose is 118 mg/dL, down from prior highs. Continue metformin and monitor for sustained control.
            </div>
          </div>
          <div className="summary-card trending">
            <div className="summary-card-title">Prior Acute Deterioration — No Recent Recurrence</div>
            <div className="summary-card-content">
              Urgent Care and ER visits in September reflect a prior period of instability. No acute encounters are visible since then. Continue follow-up given the earlier cardiometabolic worsening.
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
            <div className="summary-card-title">Blood Pressure — Controlled</div>
            <div className="summary-card-content">
              Latest BP is 120/78 at the Jan 14 PCP visit, improved from 162/98 and 158/96 during the September acute-care period. Continue current antihypertensive therapy.
            </div>
          </div>
          <div className="summary-card stable">
            <div className="summary-card-title">Renal Function — Stable</div>
            <div className="summary-card-content">
              Creatinine is 0.97 mg/dL, BUN has normalized to 16 mg/dL, and eGFR is 78 mL/min. Continue routine renal monitoring.
            </div>
          </div>
          <div className="summary-card stable">
            <div className="summary-card-title">Hypothyroidism — Well Managed</div>
            <div className="summary-card-content">
              TSH is 2.2 mIU/L with no recent thyroid-related concerns. Continue current management.
            </div>
          </div>
          <div className="summary-card stable">
            <div className="summary-card-title">Symptoms — Improved</div>
            <div className="summary-card-content">
              Recent patient-reported symptom burden is low, with fatigue at 2 and pain at 1 on the latest check-in. No major recent distress signal is visible.
            </div>
          </div>
          <div className="summary-card stable">
            <div className="summary-card-title">Anemia — Resolved</div>
            <div className="summary-card-content">
              Previously documented anemia remains resolved with no recent findings suggesting recurrence.
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ClinicalSummaryHeader
