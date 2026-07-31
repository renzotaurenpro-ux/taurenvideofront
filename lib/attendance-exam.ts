export const ATTENDANCE_EXAM_TOTAL = 15
export const ATTENDANCE_EXAM_PASS_GRADE = 5.0
export const ATTENDANCE_EXAM_MAX_GRADE = 7
export const ATTENDANCE_EXAM_MAX_WRONG = 5
export const ATTENDANCE_EXAM_MIN_CORRECT = 10

export function calcAttendanceExamGrade(correct: number, total: number) {
  if (total <= 0) return 1
  return Math.round((1 + (correct / total) * 6) * 10) / 10
}

export function passesAttendanceExamGrade(nota: number) {
  return nota >= ATTENDANCE_EXAM_PASS_GRADE
}

export function formatAttendanceExamGrade(nota: number) {
  return nota.toFixed(1).replace('.', ',')
}

export function hasPassedExamFromStatus(examCertificate: unknown, canTakeExam: boolean) {
  if (examCertificate) return true
  return !canTakeExam
}
