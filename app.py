import os
from flask import Flask, session, redirect, request, url_for, jsonify, render_template, flash
from requests_oauthlib import OAuth2Session
from functools import wraps
import requests

OAUTH2_CLIENT_ID = os.getenv("OAUTH2_CLIENT_ID")
OAUTH2_CLIENT_SECRET = os.getenv("OAUTH2_CLIENT_SECRET")
OAUTH2_REDIRECT_URI = os.getenv("OAUTH2_REDIRECT_URI")

API_BASE_URL = os.environ.get('API_BASE_URL', 'https://discordapp.com/api')
AUTHORIZATION_BASE_URL = API_BASE_URL + '/oauth2/authorize'
TOKEN_URL = API_BASE_URL + '/oauth2/token'

app = Flask(__name__)
app.config['SECRET_KEY'] = OAUTH2_CLIENT_SECRET

if 'http://' in OAUTH2_REDIRECT_URI:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'


def token_updater(token):
    session['oauth2_token'] = token


def make_session(token=None, state=None, scope=None):
    return OAuth2Session(
        client_id=OAUTH2_CLIENT_ID,
        token=token,
        state=state,
        scope=scope,
        redirect_uri=OAUTH2_REDIRECT_URI,
        auto_refresh_kwargs={
            'client_id': OAUTH2_CLIENT_ID,
            'client_secret': OAUTH2_CLIENT_SECRET,
        },
        auto_refresh_url=TOKEN_URL,
        token_updater=token_updater)


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash("You need to login first")
            return redirect(request.referrer)

    return wrap


def dj_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/get/user/',
                          json={"authkey": os.getenv("WEB_AUTH_KEY"),
                                "user_id": session['discord_id']}).json()
        try:
            if int(os.getenv("BOT_COMMANDER_ROLE_ID")) in r['roles']:
                return f(*args, **kwargs)
            else:
                flash("You need to be a DJ to perform this action")
                return redirect(request.referrer)
        except Exception as e:
            app.logger.error("Checking User Roles")
            app.logger.exception(e)
            if 'error' in r:
                flash(r['error'])
            else:
                flash("Something Went wrong contact @mrsupiri on twitter")
            return redirect(request.referrer)

    return wrap


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login/')
def login():
    scope = request.args.get(
        'scope',
        'identify')
    discord = make_session(scope=scope.split(' '))
    authorization_url, state = discord.authorization_url(AUTHORIZATION_BASE_URL)
    session['oauth2_state'] = state
    return redirect(authorization_url)


@app.route('/callback/')
def callback():
    if request.values.get('error'):
        return request.values['error']
    discord = make_session(state=session.get('oauth2_state'))
    token = discord.fetch_token(
        TOKEN_URL,
        client_secret=OAUTH2_CLIENT_SECRET,
        authorization_response=request.url)
    session['oauth2_token'] = token
    session['logged_in'] = True
    discord = make_session(token=session.get('oauth2_token'))
    user = discord.get(API_BASE_URL + '/users/@me').json()
    session['discord_id'] = user['id']
    session['discord_username'] = user['username']
    session['discord_discriminator'] = user['discriminator']
    return redirect(url_for('index'))


@app.route('/logout/')
@login_required
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/bot/toggle/play/')
@login_required
@dj_required
def bot_toggle_play():
    bot_status = requests.get(f"{os.getenv('DISCORD_BOT_REST_API')}/player_status/").json()
    j = {"authkey": os.getenv("WEB_AUTH_KEY"),
         "user_id": session['discord_id'],
         "cmd": "pause",
         "args": ""}

    if bot_status['is_pause']:
        j['cmd'] = "resume"

    r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                      json=j).json()

    if 'error' in r:
        flash(r['error'])
    return redirect(url_for('index'))


@app.route('/bot/skip/')
@login_required
@dj_required
def bot_skip():
    r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                      json={"authkey": os.getenv("WEB_AUTH_KEY"),
                            "user_id": session['discord_id'],
                            "cmd": "skip",
                            "args": ""}).json()
    if 'error' in r:
        flash(r['error'])
    return redirect(url_for('index'))


@app.route('/bot/volume/high/')
@login_required
@dj_required
def bot_volume_high():
    r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                      json={"authkey": os.getenv("WEB_AUTH_KEY"),
                            "user_id": session['discord_id'],
                            "cmd": "volume",
                            "args": "100"}).json()
    if 'error' in r:
        flash(r['error'])
    return redirect(url_for('index'))


@app.route('/bot/volume/low/')
@login_required
@dj_required
def bot_volume_low():
    r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                      json={"authkey": os.getenv("WEB_AUTH_KEY"),
                            "user_id": session['discord_id'],
                            "cmd": "volume",
                            "args": "5"}).json()
    if 'error' in r:
        flash(r['error'])
    return redirect(url_for('index'))


@app.route('/bot/toggle/autoplay')
@login_required
@dj_required
def bot_toggle_autoplay():
    bot_status = requests.get(f"{os.getenv('DISCORD_BOT_REST_API')}/player_status/").json()
    arg = "on"
    if bot_status['auto_play']:
        arg = "off"
    r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                      json={"authkey": os.getenv("WEB_AUTH_KEY"),
                            "user_id": session['discord_id'],
                            "cmd": "autoplay",
                            "args": arg}).json()
    if 'error' in r:
        flash(r['error'])
    return redirect(url_for('index'))


@app.route('/bot/volume/set/', methods=["POST"])
@login_required
@dj_required
def bot_set_volume():
    try:
        r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                          json={"authkey": os.getenv("WEB_AUTH_KEY"),
                                "user_id": session['discord_id'],
                                "cmd": "volume",
                                "args": str(request.form['volume_level'])}).json()
        if 'error' in r:
            flash(r['error'])
        return redirect(url_for('index'))
    except Exception as e:
        app.logger.error("Something went wrong while changing volume")
        app.logger.exception(e)
        flash("Something went wrong while changing volume")
        return redirect(url_for('index'))


@app.route('/bot/song/play/', methods=["POST"])
@login_required
@dj_required
def bot_play_song():
    try:
        r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                          json={"authkey": os.getenv("WEB_AUTH_KEY"),
                                "user_id": session['discord_id'],
                                "cmd": "play",
                                "args": request.form['yt_song_url']}).json()
        if 'error' in r:
            flash(r['error'])
        return redirect(url_for('index'))
    except Exception as e:
        if request.form:
            app.logger.info(str(request.form))
        app.logger.error("Something went wrong while requesting the song")
        app.logger.exception(e)
        flash("Something went wrong while requesting the song")
        return redirect(url_for('index'))


@app.route('/bot/song/move/up/<song_id>/')
@login_required
@dj_required
def bot_move_song_up(song_id):
    try:
        r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                          json={"authkey": os.getenv("WEB_AUTH_KEY"),
                                "user_id": session['discord_id'],
                                "cmd": "move",
                                "args": f"{song_id} {int(song_id)-1}"}).json()
        if 'error' in r:
            flash(r['error'])
        return redirect(url_for('index'))
    except Exception as e:
        app.logger.error("Something went wrong change song queue position")
        app.logger.exception(e)
        flash("Something went wrong change song queue position")
        return redirect(url_for('index'))


@app.route('/bot/song/move/top/<song_id>/')
@login_required
@dj_required
def bot_move_song_top(song_id):
    try:
        r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                          json={"authkey": os.getenv("WEB_AUTH_KEY"),
                                "user_id": session['discord_id'],
                                "cmd": "move",
                                "args": f"{song_id}"}).json()
        if 'error' in r:
            flash(r['error'])
        return redirect(url_for('index'))
    except Exception as e:
        app.logger.error("Something went wrong moving the song to the top of the queue")
        app.logger.exception(e)
        flash("Something went wrong moving the song to the top of the queue")
        return redirect(url_for('index'))


@app.route('/bot/clear/queue/')
@login_required
@dj_required
def bot_clear_queue():
    r = requests.post(f'{os.getenv("DISCORD_BOT_REST_API")}/API/bot/request/',
                      json={"authkey": os.getenv("WEB_AUTH_KEY"),
                            "user_id": session['discord_id'],
                            "cmd": "clearQueue",
                            "args": ""}).json()
    if 'error' in r:
        flash(r['error'])
    return redirect(url_for('index'))


@app.route('/player_status/', methods=["GET"])
def get_player_status():
    try:
        bot_status = requests.get(f"{os.getenv('DISCORD_BOT_REST_API')}/player_status/")
        app.logger.info(f"bot_status - {bot_status.json()}")
        if bot_status.status_code == 200 and "now_playing" in bot_status.json():
            return jsonify(bot_status.json())

    except Exception as e:
        app.logger.error("Bot API didn't returned error")
        app.logger.exception(e)

    finally:
        return jsonify(
            {
                "now_playing": {"song": None, "uploader": None, "thumbnail": None, "url": None,
                                "duration": None, "progress": None, "extractor": None, "requester": None,
                                "is_pause": False},
                'queue': [],
                "is_pause": False,
                "auto_play": False,
                "volume": 100
            }
        )


if __name__ == '__main__':
    import logging
    logging.basicConfig(filename='dashboard.log', level=logging.DEBUG)
    app.logger.debug("Starting Rathumakara Dashboard")
    app.run(host="0.0.0.0")
