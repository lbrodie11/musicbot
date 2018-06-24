// const SPOTIFY_CLIENT_ID = '5e1e2cc3a0dd422eb11244d00e3bb9a1';
// const RESPONSE_CALLBACK = '/loggedin.html'; // This file is in ./public/
// const ORIGIN = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: ''); // This is the http://domain.tld part of the location
// const SPOTIFY_ENDPOINT = 'https://accounts.spotify.com/authorize';

var waitRetryLimit = 50;
var waitRetry = 0;
var loginWindow = null;

/*
 * The method that will wait until the Spotify callback page sets the global spotifyEntries
 * variable, or it exceeds the time alotted.
 */
function WaitForSpotify(resolve, reject) {

    // First check to see if we've tried too many times and reject the promise if so
    if (waitRetry > waitRetryLimit) {
        loginWindow.close();
        reject({errors: [{error: 'wait limit exceeded', payload: window.spotifyEntries}]});
    }

    // Otherwise, increment the number of tries counter
    waitRetry++;

    // Check to see if the spotifyEntries is still not set, and call this method again
    if (window.spotifyEntries === null) {
        setTimeout(WaitForSpotify, 500, resolve, reject)
    }
    // If the spotifyEntries have been set, then determine if the authorization was successful
    else {
        loginWindow.close();

        if (window.spotifyEntries.access_token) {
            // when the callback included the access_token, we have a successful login, and resolve the promise
            resolve(window.spotifyEntries)
        } else {
            // when the callback did not include the access_token, there was an error and we reject the promise
            reject({errors: [{error: 'authorization error', payload: window.spotifyEntries}]})
        }
    }
}

/*
 * Simple function that takes an Object and builds a URL query string out of it.
 */
function buildQueryString(params) {
    return Object.keys(params)
        .map(key => {
            return `${key}=${params[key]}`
        })
        .join('&')
}

/*
 * Build up the URL to Spotify to authorize the applicaiton.
 */
function spotifyLoginUrl() {
    const queryString = buildQueryString({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'token',
        redirect_uri: ORIGIN + RESPONSE_CALLBACK, // This must be specified in the Spotify application manager
        state: randomString()
    });
    return `${SPOTIFY_ENDPOINT}?${queryString}`;
}

/*
 * This function is just returning a random string of letters to provide a state
 * check. We're not actually doing anything with this, but we should be saving it
 * and checking against the state value Spotify returns with our callback.
 */
function randomString() {
    return (Math.random() * Math.random()).toString(36).substring(2) +
        (Math.random() * Math.random()).toString(36).substring(2);
}

/*
 * The default function - this handles obtaining the credential from Spotify.
 */
export default () => {

    // Initialize the global variable to null; we want to do this here
    // in case we call this method more than once in the program.
    window.spotifyEntries = null;

    // Also reset the number of tries
    window.waitRetry = 0;

    // This opens up a new window (you'll have to turn pop-up blocking off
    // for the page to make this work). It creates a smaller window that loads
    // up the Spotify authorization page letting the user log in or simply
    // approve the request for this app.
    loginWindow = window.open(spotifyLoginUrl(), 'Spotify Login',
        'width=800,height=600,resizable,scrollbars=yes,status=1');

    // This creates an asynchronous wait promise. Calling the function WaitForSpotify
    // and passing in the resolve and reject parameters are explained above.
    return new Promise((resolve, reject) => {
        WaitForSpotify(resolve, reject)
    })
}
