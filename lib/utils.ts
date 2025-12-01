export function getErrorResponse(text: string) {
  return { text }
}
export function isValidNumber(metronomeId: String): boolean {
  return metronomeId && !Number.isNaN(Number(metronomeId))
}
