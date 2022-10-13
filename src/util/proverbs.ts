
export const proverbs: string[] = [
  'Rebecca Purple is the newest entry in the list of web colors. It was named after the daughter of Eric Meyer, Rebecca https://meyerweb.com/eric/',
  'I like to write "import numpy as npy" when I use numpy. "npy" means "girl friend" in chinese.',
  // 'asd2',
  // 'asd3',
  // 'asd4',
]

export function getRandomProverbs(): string {
  return proverbs[Math.floor(Math.random()*proverbs.length)]
}