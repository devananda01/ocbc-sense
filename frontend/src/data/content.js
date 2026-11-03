import pages from './pages.json'

export function getPage(id, language = 'en') {
  const page = pages.find((p) => p._id === id)
  if (!page || language === 'en') return page
  const suffix = language === 'zh' ? '_zh' : language === 'ms' ? '_ms' : ''
  if (!suffix) return page
  return {
    ...page,
    title: page[`title${suffix}`] ?? page.title,
    text: page[`text${suffix}`] ?? page.text,
  }
}

export function pageText(page, wording) {
  return page?.text?.[wording] ?? page?.text?.standard ?? ''
}
