import json
import os
from flask import Flask, session, redirect, request, url_for, jsonify, render_template
from requests_oauthlib import OAuth2Session

OAUTH2_CLIENT_ID = "498036184501714944"
OAUTH2_CLIENT_SECRET = "q8nOQLkd-jdKJUVC2jonYLitYsDOADiL"
OAUTH2_REDIRECT_URI = 'https://rathumakara.iconicto.com/callback/'

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
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/player_status/', methods=["GET"])
def get_player_status():
    try:
        with open('/root/RathuMakaraFM-DiscordBot/status.json') as f:
            data = json.load(f)

        return jsonify(data)
    except:
        return jsonify(
            {
                "now_playing": {"song": None, "uploader": None, "thumbnail": None, "url": None,
                                "duration": None, "progress": None, "extractor": None, "requester": None,
                                "is_pause": False},
                'queue': [],
                "is_pause": False,
                "auto_play": False
            }
        )


@app.route('/bot/play/')
def bot_play():
    return True


@app.route('/bot/pause/')
def bot_pause():
    return True


@app.route('/bot/skip/')
def bot_skip():
    return True


@app.route('/bot/volume/high/')
def bot_volume_high():
    return True


@app.route('/bot/volume/low/')
def bot_volume_low():
    return True


@app.route('/bot/autoplay/enable')
def bot_autoplay_enable():
    return True


@app.route('/bot/autoplay/disable')
def bot_autoplay_disable():
    return True


@app.route('/bot/volume/set/', methods=["POST"])
def bot_set_volume():
    return True


if __name__ == '__main__':
    app.run()
