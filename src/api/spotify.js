import { getLogger } from 'log4js';
const SpotifyWebApi = require('spotify-web-api-node');
const puppeteer = require('puppeteer');
import { insertArtist, updateArtistAlbums } from '../persistence/artist';

const logger = getLogger('Spotify Service');

var spotifyApi = new SpotifyWebApi();

const {
  EMAIL,
  PASSWORD
} = process.env;

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

export const getFollowedArtists = async (after) => {
  logger.info('Get Followed Artists data initialized')
  const limit = 50

  const response = await spotifyApi.getFollowedArtists({ limit, after })
  logger.info(`Total Artists I'm Following: ${response.body.artists.total}`);
  const nextAfter = response.body.artists.cursors.after
  const artists = response.body.artists.items

  if (nextAfter) {
    return [].concat(artists, await getFollowedArtists(nextAfter))
  } else {
    return artists
  }
};

export const getUser = () => (
  spotifyApi.getMe()
);

export const getArtistAlbums = (artistId) => (
  // Future Feature. Get Singles as well
  spotifyApi.getArtistAlbums(artistId, { album_type: 'album,single', limit: 1 })
);

export const getNewReleases = async (artistIds, artistsNames, albumNames) => {
  var newReleases = [];
  for (var i = 0; i < artistIds.length; i++) {
    var artistAlbum = await getArtistAlbums(artistIds[i]);
    var date = await artistAlbum.body.items[0].release_date;
    var artistName = await artistAlbum.body.items[0].artists[0].name;
    var artistAlbumName = await artistAlbum.body.items[0].name;
    var releaseDate = new Date(date);
    var currentDate = new Date('2018-6-27');
    if (releaseDate >= currentDate && !artistsNames.includes(artistName)) {
      logger.info(`Adding New Artist & New Album:  ${artistAlbum} `)
      await newReleases.push(artistAlbum);
      insertArtist(artistName, artistAlbumName)
    } else if (releaseDate >= currentDate && !albumNames.find(el => el[0] === artistAlbumName)) {
      logger.info(`Adding new Album to Database:  ${artistAlbumName}`);
      await newRelease.push(artistAlbum);
      await updateArtistAlbums(artistName, artistAlbumName)
    }
  }
  return newReleases;
};

const
  BASE_URL = 'https://developer.spotify.com/console/get-following/',
  GET_TOKEN_BTN_SELECTOR = 'button[data-target="#oauth-modal"]',
  USR_LIB_CHECKBOX_SELECTOR = '#scope-user-follow-read',
  REQ_TOKEN_BTN_SELECTOR = '#oauthRequestToken',
  LOGIN_BUTTON_SELECTOR = 'a.btn',
  TOKEN_FIELD_SELECTOR = '#oauth-input',
  EMAIL_FIELD_SELECTOR = '#email',
  PASSWORD_FIELD_SELECTOR = '#pass',
  FACEBOOK_LOGIN_BUTTON_SELECTOR = '#loginbutton',

  FIVE_MINUTES_IN_MILLISECOUNDS = 1000 * 60 * 5

export async function getSpotifyToken() {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--user-data-dir'
    ]
  })
  const page = await browser.newPage()

  await page.goto(BASE_URL)
  await page.click(GET_TOKEN_BTN_SELECTOR)
  await page.waitForSelector(USR_LIB_CHECKBOX_SELECTOR, { visible: true })
  await page.waitForSelector(REQ_TOKEN_BTN_SELECTOR, { visible: true })
  await page.waitFor(1000)
  await page.click(USR_LIB_CHECKBOX_SELECTOR)
  await page.click(REQ_TOKEN_BTN_SELECTOR)
  await page.waitForSelector(LOGIN_BUTTON_SELECTOR)
  await page.click(LOGIN_BUTTON_SELECTOR)
  await page.click(LOGIN_BUTTON_SELECTOR)
  await page.waitFor(1000)
  await page.focus(EMAIL_FIELD_SELECTOR)
  await page.waitFor(1000)
  await page.type(EMAIL_FIELD_SELECTOR, EMAIL)
  await page.waitFor(1000)
  await page.focus(PASSWORD_FIELD_SELECTOR)
  await page.waitFor(1000)
  await page.type(PASSWORD_FIELD_SELECTOR, PASSWORD)
  await page.waitFor(5000)
  await page.click(FACEBOOK_LOGIN_BUTTON_SELECTOR)

  //USER LOGS IN

  // await page.waitForSelector(TOKEN_FIELD_SELECTOR,
  //   { timeout: FIVE_MINUTES_IN_MILLISECOUNDS })
  await page.waitFor(10000)
  const token_field_el = await page.$(TOKEN_FIELD_SELECTOR)
  await page.waitFor(5000)
  const token_field_property = await token_field_el.getProperty('value')
  await page.waitFor(5000)
  const token = await token_field_property.jsonValue()
  await page.waitFor(5000)
  await browser.close()
  return token
}