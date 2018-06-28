import { getLogger } from 'log4js';
const SpotifyWebApi = require('spotify-web-api-node');
const puppeteer = require('puppeteer');

const logger = getLogger('Spotify Service');

var spotifyApi = new SpotifyWebApi();

export const setAccessToken = (token) => {
  spotifyApi.setAccessToken(token);
};

export const getArtists = () => (
  spotifyApi.getUserPlaylists()
    .then((data) => {
      data.body.items.forEach(item => item);
    })
    .then(data => data)
    .catch(err => err)
);

export const getFollowedArtists = () => (
  logger.info('Get Followed Artists data initialized'),
  spotifyApi.getFollowedArtists()
);

export const getUser = () => (
  spotifyApi.getMe()
);

export const getArtistAlbums = (artistId) => (
  spotifyApi.getArtistAlbums(artistId, { limit: 1 })
);

export const getNewReleases = () => (
  logger.info('Get New Releases data initialized'),
  spotifyApi.getNewReleases()
);

const
  BASE_URL = 'https://developer.spotify.com/console/get-following/',
  GET_TOKEN_BTN_SELECTOR = 'input[data-target="#oauth-modal"]',
  USR_LIB_CHECKBOX_SELECTOR = '#scope-user-follow-read',
  REQ_TOKEN_BTN_SELECTOR = '#oauthRequestToken',
  LOGIN_BUTTON_SELECTOR = 'a.btn',
  TOKEN_FIELD_SELECTOR = '#oauth',
  USERNAME_FIELD_SELECTOR = '#login-username',
  FIVE_MINUTES_IN_MILLISECOUNDS = 1000 * 60 * 5

export async function getSpotifyToken() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 550, devtools: true })
  const page = await browser.newPage()

  await page.goto(BASE_URL)
  await page.waitFor(35000)
  const frame = await page.frames().find(f => f.name() === 'iframe')
  const button = await frame.$('#oauth-modal');
  button.click;
  // await page.click(frame.$(GET_TOKEN_BTN_SELECTOR))
  await page.waitForSelector(USR_LIB_CHECKBOX_SELECTOR, { visible: true })
  await page.waitForSelector(REQ_TOKEN_BTN_SELECTOR, { visible: true })
  await page.waitFor(1000)
  await page.click(USR_LIB_CHECKBOX_SELECTOR)
  await page.click(REQ_TOKEN_BTN_SELECTOR)
  await page.waitForSelector(LOGIN_BUTTON_SELECTOR)
  await page.click(LOGIN_BUTTON_SELECTOR)
  await page.focus(USERNAME_FIELD_SELECTOR)

  //USER LOGS IN

  await page.waitForSelector(TOKEN_FIELD_SELECTOR,
    { timeout: FIVE_MINUTES_IN_MILLISECOUNDS })
  const token_field_el = await page.$(TOKEN_FIELD_SELECTOR)
  const token_field_property = await token_field_el.getProperty('value')
  const token = await token_field_property.jsonValue()
  await browser.close()
  return token
}