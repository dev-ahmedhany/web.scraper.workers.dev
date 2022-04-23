import html from './html.js'
import contentTypes from './content-types.js'
import Scraper from './scraper.js'
import { generateJSONResponse, generateErrorJSONResponse } from './json-response.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const searchParams = new URL(request.url).searchParams

  let url = searchParams.get('url')
  if (url && !url.match(/^[a-zA-Z]+:\/\//)) url = 'http://' + url

  const selector = searchParams.get('selector')
  const attr = searchParams.get('attr')
  const spaced = searchParams.get('spaced') // Adds spaces between tags
  const pretty = searchParams.get('pretty')
  const egybest = searchParams.get('egybest')

  if(url && egybest){
    return handleAPIRequest2({ url })
  }

  if (!url || !selector) {
    return handleSiteRequest(request)
  }

  return handleAPIRequest({ url, selector, attr, spaced, pretty })
}

async function handleSiteRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/' || url.pathname === '') {
    return new Response(html, {
      headers: { 'content-type': contentTypes.html }
    })
  }

  return new Response('Not found', { status: 404 })
}

async function handleAPIRequest({ url, selector, attr, spaced, pretty }) {
  let scraper, result

  try {
    scraper = await new Scraper().fetch(url)
  } catch (error) {
    return generateErrorJSONResponse(error, pretty)
  }

  try {
    if (!attr) {
      result = await scraper.querySelector(selector).getText({ spaced })
    } else {
      result = await scraper.querySelector(selector).getAttribute(attr)
    }

  } catch (error) {
    return generateErrorJSONResponse(error, pretty)
  }

  return generateJSONResponse({ result }, pretty)
}

async function handleAPIRequest2({ url, pretty=true }) {
  let scraper, result, result2, result3, response, x

  try {
    scraper =  new Scraper()
    x=1
    await scraper.fetch(url)
    x=2
    result = await scraper.querySelector("#watch_dl iframe").getAttribute("src")
    x=3
    response = scraper.getResponse()
    x=4
    scraper =  new Scraper()
    x=5
    await scraper.fetch("https://aero.egybest.golf"+result)
    x=6
    result2 = await scraper.querySelector("body").getText({ spaced:true })
    x=7
    scraper =  new Scraper()
    x=8
    await scraper.fetch("https://aero.egybest.golf"+result)
    x=9
    result3 = await scraper.querySelector("html").getText({ spaced:true })
    x=10
  } catch (error) {
    return generateErrorJSONResponse(error, pretty, x)
  }

  return generateJSONResponse({ result, result2, result3, response }, pretty)
}