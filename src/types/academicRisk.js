/**
 * @typedef {Object} PredictionProbability
 * @property {number|string} very_low_probability
 * @property {number|string} low_probability
 * @property {number|string} medium_probability
 * @property {number|string} high_probability
 * @property {number|string} critical_probability
 */

/**
 * @typedef {Object} PredictionFactor
 * @property {string} factor_name
 * @property {string} student_value
 * @property {number|string} importance
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} category
 * @property {string} priority
 * @property {string} title
 * @property {string} description
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} Prediction
 * @property {number} id
 * @property {string} prediction_model
 * @property {number} risk_level
 * @property {string} risk_label
 * @property {number|string} confidence
 * @property {string} prediction_date
 * @property {PredictionProbability} [probabilities]
 * @property {PredictionFactor[]} [factors]
 * @property {Recommendation[]} [recommendations]
 */

/**
 * @typedef {Object} PredictionSummary
 * @property {number} totalStudents
 * @property {number} veryLow
 * @property {number} low
 * @property {number} medium
 * @property {number} high
 * @property {number} critical
 * @property {string|null} lastUpdated
 */

/**
 * @typedef {Object} PredictionResponse
 * @property {boolean} success
 * @property {string} message
 * @property {number} school_year
 * @property {number} bimester
 * @property {number} students_processed
 * @property {number} execution_time_seconds
 * @property {string} model_used
 * @property {string} prediction_generated_at
 */

/**
 * @typedef {'updated'|'pending'|'no_data'} PredictionRowStatus
 */

/**
 * @typedef {Object} AcademicRiskRow
 * @property {number} studentId
 * @property {string} studentCode
 * @property {string} fullName
 * @property {string} classroomLabel
 * @property {number|null} riskLevel
 * @property {string|null} riskLabel
 * @property {number|null} confidence
 * @property {PredictionRowStatus} status
 * @property {string|null} lastUpdated
 * @property {Prediction|null} prediction
 */

/**
 * @typedef {Object} AcademicRiskFilters
 * @property {number|null} schoolYear
 * @property {number|null} bimester
 * @property {number|null} gradeSectionId
 * @property {number|null} studentId
 */

export const RISK_LEVELS = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5,
}

export const PREDICTION_STATUS = {
  UPDATED: 'updated',
  PENDING: 'pending',
  NO_DATA: 'no_data',
}

export const RECOMMENDATION_CATEGORIES = {
  ACADEMIC: 'ACADEMIC',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  TUTORING: 'TUTORING',
  FAMILY: 'FAMILY',
}

export const RECOMMENDATION_PRIORITIES = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
}

export const BIMESTER_TO_MODEL = {
  1: 'B1',
  2: 'B2',
  3: 'B3',
}
