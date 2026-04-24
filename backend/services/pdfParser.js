import fs from 'fs/promises'
import path from 'path'
import pdf from 'pdf-parse/lib/pdf-parse.js'

export async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath)
  const data = await pdf(buffer)
  return data.text ? data.text.trim() : ''
}

export async function parsePolicyFile(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  if (extension === '.pdf') {
    return parsePdf(filePath)
  }

  if (extension === '.json') {
    const json = await fs.readFile(filePath, 'utf8')
    try {
      const parsed = JSON.parse(json)
      if (typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2)
      }
      return String(parsed)
    } catch (error) {
      return String(json)
    }
  }

  if (extension === '.txt') {
    return (await fs.readFile(filePath, 'utf8')).trim()
  }

  return ''
}
