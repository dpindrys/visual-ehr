import { Segment } from '../utils/types'

interface ClinicalSummaryHeaderProps {
  segments: Segment[]
}

function IconAlertNeutral() {
  return (
    <svg className="summary-header-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}

function IconMonitor() {
  return (
    <svg className="summary-header-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function IconCheckStable() {
  return (
    <svg className="summary-header-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

const ClinicalSummaryHeader = ({ segments: _segments }: ClinicalSummaryHeaderProps) => {
  return (
    <div className="clinical-summary-header">

      <section className="summary-section summary-section-critical" aria-labelledby="summary-critical-heading">
        <div className="summary-section-info-strip">
          <div className="summary-section-header summary-section-header-neutral" id="summary-critical-heading">
            <span className="summary-section-header-icon" aria-hidden>
              <IconAlertNeutral />
            </span>
            <div className="summary-section-header-copy">
              <span className="summary-section-header-title">No critical issues requiring immediate action</span>
              <p className="summary-section-header-detail">
                No current critical issues based on the latest available vitals, labs, and symptom data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="summary-section summary-section-trending" aria-labelledby="summary-trending-heading">
        <header className="summary-section-header summary-section-header-trending">
          <span className="summary-section-header-icon" aria-hidden>
            <IconMonitor />
          </span>
          <h2 className="summary-section-header-title" id="summary-trending-heading">
            2 conditions require monitoring
          </h2>
        </header>
        <div className="summary-section-header-divider" aria-hidden />
        <div className="summary-cards">
          <article className="summary-card">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Type 2 Diabetes</h3>
                <p className="summary-card-interpretation">Improved; continue monitoring glycemic control.</p>
              </div>
              <span className="summary-card-chip">Metabolic</span>
            </div>
            <p className="summary-card-content">
              A1c improved from 10.8% to 6.7%. Latest glucose is 118 mg/dL, down from prior highs. Continue metformin and monitor for sustained control.
            </p>
          </article>
          <article className="summary-card">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Prior acute deterioration</h3>
                <p className="summary-card-interpretation">No recent recurrence; continue follow-up as clinically indicated.</p>
              </div>
              <span className="summary-card-chip">Acute care</span>
            </div>
            <p className="summary-card-content">
              Urgent Care and ER visits in September reflect a prior period of instability. No acute encounters are visible since then. Continue follow-up given the earlier cardiometabolic worsening.
            </p>
          </article>
        </div>
      </section>

      <section className="summary-section summary-section-stable" aria-labelledby="summary-stable-heading">
        <header className="summary-section-header summary-section-header-stable">
          <span className="summary-section-header-icon" aria-hidden>
            <IconCheckStable />
          </span>
          <h2 className="summary-section-header-title" id="summary-stable-heading">
            5 conditions stable under current management
          </h2>
        </header>
        <div className="summary-section-header-divider" aria-hidden />
        <div className="summary-cards summary-cards-stable">
          <article className="summary-card">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Blood Pressure</h3>
                <p className="summary-card-interpretation">Controlled; continue current antihypertensive therapy.</p>
              </div>
              <span className="summary-card-chip">Vital sign</span>
            </div>
            <p className="summary-card-content">
              Latest BP is 120/78 at the Jan 14 PCP visit, improved from 162/98 and 158/96 during the September acute-care period.
            </p>
          </article>
          <article className="summary-card">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Renal Function</h3>
                <p className="summary-card-interpretation">Stable; continue routine renal monitoring.</p>
              </div>
              <span className="summary-card-chip">Renal labs</span>
            </div>
            <p className="summary-card-content">
              Creatinine is 0.97 mg/dL, BUN has normalized to 16 mg/dL, and eGFR is 78 mL/min.
            </p>
          </article>
          <article className="summary-card">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Hypothyroidism</h3>
                <p className="summary-card-interpretation">Well managed; continue current therapy.</p>
              </div>
              <span className="summary-card-chip">Endocrine</span>
            </div>
            <p className="summary-card-content">
              TSH is 2.2 mIU/L with no recent thyroid-related concerns.
            </p>
          </article>
          <article className="summary-card">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Symptoms</h3>
                <p className="summary-card-interpretation">Improved; low reported burden on latest check-in.</p>
              </div>
              <span className="summary-card-chip">Patient reported</span>
            </div>
            <p className="summary-card-content">
              Recent patient-reported symptom burden is low, with fatigue at 2 and pain at 1 on the latest check-in. No major recent distress signal is visible.
            </p>
          </article>
          <article className="summary-card summary-card-secondary">
            <div className="summary-card-header-row">
              <div className="summary-card-title-block">
                <h3 className="summary-card-title">Anemia</h3>
                <p className="summary-card-interpretation">Resolved; no evidence of recurrence.</p>
              </div>
              <span className="summary-card-chip">Hematologic</span>
            </div>
            <p className="summary-card-content">
              Previously documented anemia remains resolved with no recent findings suggesting recurrence.
            </p>
          </article>
        </div>
      </section>

    </div>
  )
}

export default ClinicalSummaryHeader
