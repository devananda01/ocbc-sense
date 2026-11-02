import pages from './pages.json'

export function getPage(id) {
  return pages.find((p) => p._id === id)
}

export function pageText(page, wording) {
  return page.text[wording] ?? page.text.standard
}