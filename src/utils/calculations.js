export function calcBMI(weightKg, heightCm) {
  const hm = heightCm / 100
  return +(weightKg / (hm * hm)).toFixed(1)
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' }
  if (bmi < 25)   return { label: 'Normal',      color: '#34d399' }
  if (bmi < 30)   return { label: 'Overweight',  color: '#fbbf24' }
  return           { label: 'Obese',             color: '#f87171' }
}

export function getHealthyWeightRange(heightCm) {
  const hm = heightCm / 100
  return {
    min: +(18.5 * hm * hm).toFixed(1),
    max: +(24.9 * hm * hm).toFixed(1),
  }
}

export function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

export function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
